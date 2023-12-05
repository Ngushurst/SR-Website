const bcrypt = require('bcrypt');
const CONSTANTS = require('./constants')
const { db, dbquery } = require('./db');
const email = require('./email')
const { CSVtoIntArray, generateError } = require('./helpers');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const log = require('./log');
const { v4: uuid } = require('uuid'); // usage: uuid(); -> '...' generates a lengthy random string.
const util = require('util');

const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));
/**
 * Handles actions related to user accounts and user roles.
 **/
class User {
  /**
   * ==========================
   * ||                      ||
   * ||       User           ||
   * ||       Handling       ||
   * ||                      ||
   * ==========================
   * Methods for handling changes to user accounts.
   * 
   * User: {
   *  id: integer,
   *  email: varchar(256),
   *  username: varchar(128),
   *  password: varchar(64),
   *  status: varchar(16),
   *  roles: varchar(64),
   *  resource_id: integer,
   *  auto_biography_id: integer
   * }
   * */

  /**
   * Adds a new user to the system.
   * Certain checks will be bypassed when adding the first user.
   * 
   * Needs:
   * email
   * username
   * password (optional)
   * roles (optional)
   * */
  async addUser(req, res) {
    let a = await checkInputs('addUser', req);
    if (a.error) { // Return immediately if there is an error.
      return res.status(a.error.code).json({ message: a.error.error });
    }
    let hash = bcrypt.hashSync(a.password, CONSTANTS.USER.SECURITY.SALT_ROUNDS);
    db.getConnection(async (error, connection) => {
      if (error) {
        log.error({ inputs: a, err: error }, 'user.addUser');
        res.status(500).json({ message: CONSTANTS.ERROR.DB_CONNECT + 'Unable to add user. Please try again later.' });
      } else {
        let dbq = util.promisify(connection.query).bind(connection);
        try {
          dbq('START TRANSACTION');
          // Create new user
          let args = {
            email: a.email,
            status: a.status,
            roles: a.roles,
            password: hash,
            username: a.username,
          };
          let q = 'INSERT INTO user SET ?, created_on=now()';
          let result = await dbq(q, args);
          // Log an entry into the user history
          args = {
            action: CONSTANTS.ACTION.ADD,
            user_id: result.insertId,
            changed_by: a.firstUser ? result.insertId : req.decodedToken.id, // If they're the first user, they create themselves.
            email: a.email,
            roles: a.roles,
            status: CONSTANTS.USER.STATUS.ACTIVE,
            username: a.username,
            version: 1,
          };
          q = 'INSERT INTO user_history SET ?, changed_on=now()';
          result = await dbq(q, args);

          if (!a.firstUser) { // Send password reset email to new user. (original user will be logged in straight away)
            let reset_code = await set_pswd_reset_code(user_id);
            let url = config.config.base_url + 'c/signin/welcome/' + reset_code;
            let to = a.email;
            let subject = 'Welcome to the Summit Staff Site!';
            let body = '<p>Greetings ' + a.username + ',</p><p>You\'ve been assigned an account on the Summit Reviews official webiste. To get started, please create a password for your account by clicking <a href="' + url + '">here</a>.</p>';
            let err = email.send(to, subject, body);
            if (err) { // Created user, but did not send reset email. Rollback changes.
              result = await dbq('ROLLBACK'); // Commit changes to the database
              log.error({ inputs: a, err: err }, 'user.addUser');
              res.status(500).json({ message: `User created, but failed to send an email to ${a.email}. Aborting...` });
            } else {
              res.status(200).json({ message: 'Added user successfully.' });
            }
          } else {
            result = await dbq('COMMIT'); // Operation successful. Commit changes to the database.
            res.status(200).json({ message: 'Added user successfully.' });
          }
        } catch (error) {
          dbq('ROLLBACK');
          log.error({ inputs: a, err: error }, 'user.addUser');
          res.status(500).json({ message: 'Failed to add user.' });
        } finally {
          connection.release();
        }
      }
    });
  }

  /**
   * Changes the metadata surrounding a user account.
   * Cannot be used to change a user's profile picture or autobiography.
   * 
   * Needs:
   * id
   * Optional:
   * username
   * password
   * email
   * status
   * roles
   * */
  async editUser(req, res) {
    let a = await checkInputs('editUser', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    db.getConnection(async (error, connection) => {
      if (error) {
        log.error({ inputs: a, err: error }, 'user.addUser');
        res.status(500).json({ message: CONSTANTS.ERROR.DB_CONNECT + 'Unable to edit user. Please try again later.' });
      } else {
        let dbq = util.promisify(connection.query).bind(connection);
        try {
          let q = 'START TRANSACTION';
          let result = await dbq(q);
          // Start by updating user history. Take user_id and version+1 from previous entry.
          q = 'INSERT INTO user_history (id, user_id, version, changed_by, changed_on, action, username, email, roles, status) SELECT null, user_id, version+1, ?, now(), ?, ?, ?, ?, ? FROM user_history WHERE user_id=? ORDER BY version DESC LIMIT 1';
          let args = [req.decodedToken.id, CONSTANTS.ACTION.EDIT, a.username, a.email, a.roles, a.status, a.id];
          result = await dbq(q, args);
          q = 'UPDATE user SET ? WHERE id=?';
          args = {
            username: a.username,
            email: a.email,
            roles: a.roles,
            status: a.status
          };
          if (a.password) { // password needs to be hashed before being inserted.
            args.password = bcrypt.hashSync(a.password, CONSTANTS.USER.SECURITY.SALT_ROUNDS);
          }
          result = await dbq(q, [args, a.id]);
          q = 'COMMIT';
          result = await dbq(q);
          res.status(200).json({ message: 'User account was modified!' });
        } catch (error) {
          let q = 'ROLLBACK';
          let result = await dbq(q);
          log.error({ inputs: a, err: error }, 'user.editUser');
          res.status(500).json({ message: 'Failed to edit user.' });
        }
      }
    });
  }

  /**
   * Updates a user's autobiography.
   */
  async editAutobiography(req, res) {
    let a = await checkInputs('editAutobiography', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Updates a user's profile picture.
   */
  async editProfilePicture(req, res) {
    let a = await checkInputs('editProfilePicture', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Removes a user from the system.
   * Not currently implemented. Deactivate users instead.
   * 
   * Needs:
   * user id
   * */
  async deleteUser(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Retrieves the account details of a user account,
   * including the user's autobiography and profile picture.
   * */
  async getUser(req, res) {
    let a = await checkInputs('getUser', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets the account details of all users known to the system.
   * */
  async getUsers(req, res) {
    let a = await checkInputs('getUsers', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    try {
      let q = 'SELECT id, username, email, status, roles, resource_id, DATE_FORMAT(created_on, "%b %d, %Y") AS member_since FROM user';
      let result = await dbquery(q);
      if (result.length > 0) { // Replace roles with a csv string of the role names.
        await inject_result_roles(result);
      }
      let cols = [
        { field: 'id', title: 'ID' },
        { field: 'username', title: 'Username' },
        { field: 'email', title: 'Email' },
        { field: 'status', title: 'Status' },
        { field: 'roles', title: 'Roles' },
        { field: 'privileges', title: 'Privileges' },
        { field: 'member_since', title: 'Member Since' }
      ];
      let data = { cols: cols, rows: result };
      res.status(200).json({ message: 'Got User list successfully.', data: data });
    } catch (error) {
      log.error({ inputs: a, err: error }, 'user.getUserHistory');
      res.status(500).json({ message: 'Failed to get user history.' });
    }
  }

  /**
   * Gets the history of a user account.
   * */
  async getUserHistory(req, res) {
    let a = await checkInputs('getUserHistory', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    try {
      let q = "SELECT uh.version, uh.username, uh.email, uh.status, uh.roles, u.username as changed_by, uh.changed_on, uh.action FROM user_history uh JOIN user AS u ON uh.changed_by=u.id WHERE uh.user_id=? ORDER BY version ASC";
      let result = await dbquery(q, [a.id]);
      if (result.length > 0) {
        await inject_result_roles(result);
      }
      let cols = [
        { field: 'username', title: 'Username' },
        { field: 'email', title: 'Email' },
        { field: 'status', title: 'Status' },
        { field: 'roles', title: 'Roles' },
        { field: 'changed_by', title: 'Changed By' },
        { field: 'changed_on', title: 'Changed On' },
        { field: 'action', title: 'Action' }
      ];
      let data = { cols: cols, rows: result };
      res.status(200).json({ message: '', data: data });
    } catch (error) {
      log.error({ inputs: a, err: error }, 'user.getUserHistory');
      res.status(500).json({ message: 'Failed to get user history.' });
    }
  }

  /**
   * Generates a reset code for the specified user account
   * and sends the user an email.
   * */
  async requestPasswordReset(req, res) {
    let a = await checkInputs('requestPasswordReset', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    db.getConnection(async (error, connection) => {
      if (error) {
        log.error({ inputs: a, err: error }, 'user.requestPasswordReset');
        res.status(500).json({ message: CONSTANTS.ERROR.DB_CONNECT + 'Failed to request a password reset. Please try again later.' });
      } else {
        let dbq = util.promisify(connection.query).bind(connection);
        try {
          let q = 'START TRANSACTION';
          let result = await dbq(q);
          q = 'SELECT id, username FROM user WHERE email=? AND status=?';
          result = await dbq(q, [a.email, CONSTANTS.USER.STATUS.ACTIVE]);
          if (result.length > 0) { // Only active users can reset their passwords.
            let userId = result[0].id;
            let resetCode = await generate_reset_code(userId);
            let url = config.config.base_url + 'c/signin/reset/' + resetCode;
            let subject = 'Summit Reviews: Password Reset';
            let body = '<p>' + result[0].username + ', to reset your Summit Reviews password, click <a href="' + url + '">here</a>.</p>';
            let err = email.send(a.email, subject, body);
            if (err) throw Error('Failed to send Email.');
            q = 'COMMIT';
            result = await dbq(q);
            res.status(200).json({ success: true, message: 'Password reset request was successful.' });
          } else { // Target user doesn't exist or is inactive
            q = 'ROLLBACK';
            result = await dbq(q);
            log.warn({ inputs: a }, 'user.requestPasswordReset - target user is inactive or does not exist');
            res.status(403).json({ message: 'No active user for supplied Email.' });
          }
        } catch (error) {
          await dbq('ROLLBACK');
          log.error({ inputs: a, err: error}, 'user.requestPasswordReset');
          res.status(500).json({ message: 'Failed to request password reset. Please Try again later.' });
        } finally { // Release database connection.
          connection.release();
        }
      }
    });
  }

  /**
   * Changes user's password without requiring authentication
   * if the correct code is provided.
   * 
   * Needs:
   * Reset code (resetCode)
   * new password (password)
   * */
  async resetPassword(req, res) {
    let a = await checkInputs('resetPassword', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    try {
      let args, q, result, userId; // Verify the reset code
      q = 'SELECT user_id FROM user_pswd_reset WHERE reset_code=?';
      result = await dbquery(q, a.resetCode);
      if (result.length > 0) {
        userId = result[0].user_id; // If the code matches, delete all codes associated with the target user account.
        q = 'DELETE FROM user_pswd_reset WHERE user_id=?';
        result = await dbquery(q, userId);
      } else {
        return res.status(400).json({ message: 'Reset code is invalid.' });
      }
      q = 'INSERT INTO user_history (id, user_id, version, changed_by, changed_on, action, username, email, roles, status) SELECT null, user_id, version+1, ?, now(), ?, ?, ?, ?, ? FROM user_history WHERE user_id=? ORDER BY version DESC LIMIT 1';
      args = [userId, CONSTANTS.ACTION.RESET_PASSWORD, userId]; // Change is recorded in the history as being made by the impacted user account.
      result = await dbquery(q, args);
      q = 'UPDATE user SET password=?, changed_on=now() WHERE id=?';
      let hash = bcrypt.hashSync(a.password, CONSTANTS.USER.SECURITY.SALT_ROUNDS);
      result = await dbquery(q, [hash, userId]); // Reset the password
      res.status(200).json({ message: 'Password was reset successfully.' });
    } catch (error) {
      log.error({ err: error }, 'user.resetPassword');
      res.status(500).json({ message: 'Failure to reset password.' });
    }
  }

  /**
   * Sign into the user account, passing a valid session token to the client.
   * The session token contains basic identifying user information and a list 
   * of the user's privileges.
   * 
   * Requires:
   *    Email
   *    Password
   */
  async signIn(req, res) {
    let a = await checkInputs('signIn', req);
    if (a.error) {
      return res.status(a.error.code).json({ message: a.error.error });
    }
    try {
      let q, result;
      // A special login is available for the first user.
      if (a.email === CONSTANTS.USER.FIRST_USER.EMAIL && a.password === CONSTANTS.USER.FIRST_USER.PASSWORD) {
        q = "SELECT id FROM user LIMIT 1";
        result = await dbquery(q);
        if (result.length > 0) {
          res.status(403).json({ message: 'Incorrect username or password.' });
        } else {
          res.status(403).json({ message: '', firstUser: true });
        }
      // Regular sign in.
      } else {
        q = "SELECT id, email, username, password, roles FROM user WHERE email=? AND status=?";
        result = await dbquery(q, [a.email, CONSTANTS.USER.STATUS.ACTIVE]);
        if (result.length < 1) {
          res.status(403).json({ message: 'Incorrect username or password.' });
        } else { // User found. Check password.
          let match = bcrypt.compareSync(a.password, result[0].password); // Not sure how this works with the password salt.
          if (!match) { // Wrong Password.
            res.status(403).json({ message: 'Incorrect username or password.' });
          } else {
            let r = result[0]; // Get user returned by login attempt
            let duration = config.config.session_timeout ? config.config.session_timeout + 'h' : '24h'; // Token lasts 1 day if expiration time not defined.
            let privilegeInfo = await replace_roles_single(r.roles); // get relevant privilege ids.
            let token = jwt.sign(
              { email: r.email, id: r.id, name: r.displayname, privileges: privilegeInfo.privileges },
              config.config.secret,
              { expiresIn: duration }
            );
            res.status(200).json({
              message: 'User authenticated!',
              id: r.id,
              username: r.username,
              privileges: privilegeInfo.privileges, // Array of privilege ids
              roleIds: CSVtoIntArray(r.roles), // convert to array of integers
              roleNames: privilegeInfo.roles, // Names of roles assigned to the user.
              sessionToken: token
            });
          }
        }
      }
    } catch (error) {
      log.error({ inputs: a, err: error }, 'user.signIn');
      res.status(500).json({ message: 'Failure when signing in. Try again later.' });
    }
  }

  /**
   * Signing out means deleting the token login token on the client side.
   * The server doesn't need to anything as of now.
   */
  signOut(req, res) {
    res.status(200).json({ message: 'Signed out' });
  }


  /**
   * ==========================
   * ||                      ||
   * ||       Role           ||
   * ||       Handling       ||
   * ||                      ||
   * ==========================
   * Methods for handling changes to user roles.
   * */

  /**
   * Adds a new user role
   * */
  async addRole(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Deletes an existing user role. Users with the role
   * will lose the priveleges associated with it.
   * */
  async deleteRole(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Edits a user role.
   * */
  async editRole(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets a list of user roles.
   * */
  async getRoles(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets a list of user roles.
   * */
  async getRoleHistory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }
}

/**
 * ==========================
 * ||                      ||
 * ||       Helper         ||
 * ||       Functions      ||
 * ||                      ||
 * ==========================
 * Methods for handling smaller tasks performed in several of the class' methods.
 * */

/**
 * Additional step to be performed after validating a method's arguments.
 * Checks to see if the user is authorized to perform their target action.
 * 
 * Returns an error { error, code } if there is an issue. Returns null otherwise.
 * Note: Uses codes 401 (unauthorized) and 500 (internal server error).
 * First user request may return 405 (Not allowed) if users already exist.
 * @param {object} method The name of the method being called.
 * @param {object} args An object containing the method arguments.
 * @param {object} token User login token (see user.signIn for definition). Contains user privileges.
 * @returns {object}
 */
async function authorize(method, args, token) {
  let privileges = token ? token.privileges : [];
  let admin = privileges.includes(CONSTANTS.PRIVILEGES.ALL.ID);
  let editUsers = privileges.includes(CONSTANTS.PRIVILEGES.ALL.ID);
  let error, result;
  switch (method) {
    case 'addUser': // Privileges don't apply if method refers to a firstUser call (covered in validation).
      if (!args.firstUser) {
        if (!(admin || privileges.includes(CONSTANTS.PRIVILEGES.EDIT_USERS.ID))) {
          return generateError(CONSTANTS.ERROR.NOT_AUTHORIZED + 'Insuffient privileges to add users.', 401);
        }
        error = authorize_role_change(privileges, args.roles);
        if (error) { // Return an error if the user can't assign the target roles.
          return error;
        }
      } else { // Adding first user (fail request if a user already exists)
        try { // Make sure no other users are in the system.
          let result = await dbquery('select id FROM user LIMIT 1');
          if (result && result.length > 0) { // Can only create the first user if there aren't any users in the system.
            return generateError(CONSTANTS.ERROR.INVALID_ACTION + 'Users are already present in the system. First user request cannot be executed.', 405);
          }
        } catch (err) {
          error = CONSTANTS.ERROR.DB_CONNECT + 'Please try again later.';
          log.error({ inputs: args, err: err }, 'user.authorize');
          return generateError(error, 500);
        }
      }
      break;
    case 'editUser':
      // Check if the target user is an admin. (special rules apply if so)
      let target;
      let targetIsAdmin = false; // Whether the target of the edit is an administrator.
      let lastAdmin = false; // Whether the target of the edit is the last administrator.
      try { // Check if target user is an admin. Only admins can edit other admin user accounts.
        result = await dbquery('SELECT id, status FROM user WHERE roles LIKE ?',
          // Use regex to find the admin role. (start of string, middle of string, end of string). Get list of all admins.
          [`^${CONSTANTS.USER.ROLE_ADMIN.ID}|,${CONSTANTS.USER.ROLE_ADMIN.ID},|,${CONSTANTS.USER.ROLE_ADMIN.ID}$`]);
        for (let i = 0; i < result.length; i++) {
          if (result[i].id === args.id) {
            target = result[i];
            targetIsAdmin = true;
            break;
          }
        }
        if (targetIsAdmin) { // check if target is the last active admin in the system.
          let activeAdmins = result.filter((el) => { return el.status === CONSTANTS.USER.STATUS.ACTIVE }); // Filter to active admins
          if (activeAdmins.length < 2 && target.status === CONSTANTS.USER.STATUS.ACTIVE) { // If there are 1 or fewer active admins and the target is active...
            lastAdmin = true; // The target is the last active admin.
          }
        }
      } catch (error) {
        return generateError(CONSTANTS.ERROR.DB_CONNECT + 'Please try again later.', 500);
      }
      if (lastAdmin && (args.status === CONSTANTS.USER.STATUS.INACTIVE ||
        !CSVtoIntArray(args.roles).includes(CONSTANTS.USER.ROLE_ADMIN.ID))) { // Cannot make a change that would either remove or deactivate the last admin
        return generateError(CONSTANTS.ERROR.NO_ADMINS, 403);
      }
      // Check if user is editing their own account and not changing their status or roles (no special permissions needed)
      if (token.id !== args.id) { // Editing another user account.
        if (!(admin || editUsers)) {
          return { error: CONSTANTS.ERROR.NOT_AUTHORIZED + 'Insuffient privileges to edit users.', code: 401 }
        }
        if (targetIsAdmin && !admin) { // Non-admins cannot edit admin accounts.
          return generateError(CONSTANTS.ERROR.NOT_AUTHORIZED + 'Only admins can edit admin accounts.', 401);
        }
        if (args.password) { // Other users cannot change a user's password directly.
          return generateError(CONSTANTS.ERROR.NOT_AUTHORIZED + 'Cannot change another user\'s password.', 401);
        }
      }
      if (args.status) {
        if (!(admin || editUsers)) { // Needs admin or edit user privileges to change status
          return generateError(CONSTANTS.ERROR.NOT_AUTHORIZED + 'Insuffient privileges to edit users.', 401)
        }
      }
      if (args.roles) { // Roles optional. Don't check unless present.
        error = authorize_role_change(privileges, args.roles);
        if (error) { // Return an error if the user can't assign the target roles.
          return error;
        }
      }
      break;
  }
  // Return null if the user is authorized to perform the target action.
  return null;
}

/**
 * Checks if the user has the requisite permissions to set the roles selected.
 * Does not check if the target user account can be changed by the current user (only admins can alter admin accounts).
 * Returns an object { error, code } if there is an error. Returns null if the action is valid.
 * @param {number[]} privileges An array of privilege ids belonging to the user performing the action.
 * @param {string} roles CSV string of roles to be added to be assigned to a user account.
 */
async function authorize_role_change(privileges, roles) {
  let addingAdmin = CSVtoIntArray(roles).inclues(CONSTANTS.USER.ROLE_ADMIN.ID);
  let admin = privileges.includes(CONSTANTS.PRIVILEGES.ALL);
  let editRoles = privileges.includes(CONSTANTS.PRIVILEGES.EDIT_ROLES.ID);
  let error;
  if (!(admin || editRoles)) { // Need admin or role privileges to set a user's roles.
    error = CONSTANTS.ERROR.NOT_AUTHORIZED + 'Insufficient privileges to alter user roles.';
  } else if (addingAdmin && !admin) { // Only admins can add other admins
    error = CONSTANTS.ERROR.NOT_AUTHORIZED + 'Insufficient privileges to assign the admin role.'
  }
  if (error) { // Return an error with code 401 (unauthorized) if the user has inadaquate privileges.
    return generateError(error, 401);
  }
  return null; // return null if no issues.
}

/**
 * Takes in the request object and the method being called to
 * validate the parameters and perform any relevant authorization requests.
 * Returns an object containing all of the input parameters as properties.
 * The returned object will include a property "error" {error, code} if there is a problem found while checking the inputs.
 * @param {object} req The API request object containing the params, body, and query properties.
 * @param {string} method The name of the method being used.
 * */
async function checkInputs(method, req) {
  let inputs = { ...req.params, ...req.body };
  let arguments = await validate(method, inputs); // Check argument validity (right format, correct fields present)
  if (arguments.error) return arguments; // Return early if an error is found during validation.
  arguments.error = await authorize(method, arguments, req.decodedToken); // Check user privileges. (user allowed to take the action?)
  return arguments;
}

/**
 * A method to check the parameters in the case that the input is a request to make the first user.
 * The logic in this method will only run if an extra parameter "firstUser" is present. { email: ..., password: ... }
 * The check will first check the database to make sure no other users exist, and then validate the firstUser email
 * and passwords against the expected arguments for the first user.
 * @param {object} args { ..., firstUser: { email: ..., password: ... } }
 */
async function first_user_check(args) {
  let error;
  if (args.firstUser) { // Ignore checks if the arguments lack the 'first_user argument'
    /* Validate inputs */
    if (!error) { // First user arguments must match the known constants (These should be kept on the client after a sign-in attempt).
      error = args.firstUser.email !== CONSTANTS.USER.FIRST_USER.EMAIL ? 'Unrecognized email address.' : error;
      error = args.firstUser.password !== CONSTANTS.USER.FIRST_USER.PASSWORD ? 'Unrecognized password.' : error;
      args.firstUser = true;
    }
    if (!error) { // First user requires username and password.
      error = !args.email ? CONSTANTS.ERROR.MISSING_PARAMETER + 'Email is required.' : error;
      error = !args.username ? CONSTANTS.ERROR.MISSING_PARAMETER + 'Username is required.' : error;
      error = !args.password ? CONSTANTS.ERROR.MISSING_PARAMETER + 'Password is required.' : error;
    }
    if (!error) { // Override role to provide the first user with admin privileges and sets role to active.
      args.roles = CONSTANTS.USER.ROLE_ADMIN.ID.toString();
      args.status = CONSTANTS.USER.STATUS.ACTIVE;
    }
    if (error) { // Clear first user parameter if there's a problem.
      args.firstUser = undefined;
    }
  }
  args.error = generateError(error, 400); // Only adds an error if one was generated in this method.
  return args;
}

/**
 * Generates a new password reset code for the submitted user id.
 * Returns the generated code.
 * 
 * Will throw an exception if the method fails.
 * 
 * TODO: This method can be improved by ensuring that only one valid code exists at time for a given user.
 * @param {any} user_id
 */
async function generate_reset_code(user_id) {
  let reset_code = '';
  let code_exists = true;
  while (code_exists) { // Loop until an unused reset-code is generated.
    reset_code = uuid().slice(0, 6); // Generate a random six characters as the code.
    let q = 'SELECT id FROM password_reset WHERE reset_code=?';
    let result = await dbquery(q, reset_code);
    if (result.length === 0) {
      code_exists = false; // Found a code that does not exist.
      let args = {
        user_id: user_id,
        reset_code: reset_code
      };
      q = 'INSERT INTO password_reset SET ?, created_on=now()';
      result = await dbquery(q, args);
    }
  }
  return reset_code;
}

/**
 * Replaces the contents of "roles" column in the query result rows
 * with a csv string of the associated role names.
 * Additionally adds the columns "privileges" (int[])
 * Changes the input array in place.
 * @param {object[]} queryResult An array of rows containing a column 'roles'.
 */
async function inject_result_roles(queryResult) {
  let userRoles = [];
  queryResult.forEach((row) => { userRoles.push(row.roles) });
  let result = await replace_roles(userRoles);
  for (let i = 0; i < result.length; i++) { // Join role names to get a single string for each set of roles.
    queryResult[i].roles = result[i].roles.join(', ');
    queryResult[i].privileges = result[i].privileges;
  }
}

/**
 * Accepts an array of comma separated role ids (1,2,3) and replaces each id
 * with the associated name stored in the database.
 * 
 * Returns: [{ privileges: [1,2,3], roles: ['admin', 'reviewer'], roleIds: [0,1] }]
 * @param {string[]} userRoles An array of csv strings representing role ids.
 */
async function replace_roles(userRoles) {
  try {
    let q = 'SELECT id, name, privileges FROM role';
    let roleDefinitions = dbquery(q); // [{ id, name, privileges }]
    let output = [];
    userRoles.forEach((roleList) => {
      if (!roleList) { // roles are empty, null, or undefined.
        output.push({ privileges: [], roles: [], roleIds: [] });
      } else {
        let ids = CSVtoIntArray(roleList); // break up csv and convert to integer values.
        let privileges = []; // List of unique privilege ids.
        let roles = []; // List of role names
        ids.forEach((rid) => {
          if (rid === CONSTANTS.USER.ROLE_ADMIN.ID) { // Admin role is not defined in the database.
            roles.push(CONSTANTS.USER.ROLE_ADMIN.NAME);
            privileges.push(CONSTANTS.PRIVILEGES.ALL.ID);
          } else {
            for (let i = 0; i < roleDefinitions.length; i++) {
              if (roleDefinitions[i].id === rid) { // Find roles associated with each role id
                roles.push(roleDefinitions[i].name); // Add name to list
                let privilegeIds = CSVtoIntArray(roleDefinitions[i].privileges);
                privilegeIds.forEach((pid) => { // Add privileges to the list.
                  if (!privileges.includes(pid)) {
                    privileges.push(pid); // insert all unique ids. (invalid ids will generally be ignored)
                  }
                });
                break;
              }
            }
          }
          privileges.sort();
          output.push({ privileges: privileges, roles: roles, roleIds: ids });
        });
      }
    });

    return output;
  } catch (error) {
    log.error({ inputs: userRoles, err: error }, 'user.replace_roles');
    throw (error); // Pass the error upstream.
  }
}

/**
 * Gets the privileges and role names associated with the list of role ids passed in.
 * Returns an object: { privileges: [1,2,3], roles: ['admin', 'reviewer'], roleIds: [0,1] }
 * @param {string} roles 
 */
async function replace_roles_single(roles) {
  let result = await replace_roles([roles]);
  return result[0];
}


/**
 * Validates the contents of req.params, req.query, and req.body.
 * @param {string} method The name of the method calling this function. Used to determine which fields are checked.
 * @param {object} args An object contianing the arguments being used within the specified method.
 */
async function validate(method, args) {
  let error;
  let r = {}; // output object
  const validStatus = [CONSTANTS.USER.STATUS.ACTIVE, CONSTANTS.USER.STATUS.INACTIVE]
  switch (method) {
    case 'addUser':
      args = await first_user_check(args); // Special rules apply if adding the first user.
      error = args.error;
      r = {
        username: args.username ? args.username : null, // required
        email: args.email ? args.email : null, // required
        password: args.firstUser ? args.password : Date.now().toString(), // Only the first user request can set the password directly. Required in that case only.
        roles: args.roles ? args.roles : '', // optional
        status: args.status === CONSTANTS.USER.STATUS.INACTIVE ? CONSTANTS.USER.STATUS.INACTIVE : CONSTANTS.USER.STATUS.ACTIVE, // optional. Defaults to active.
        firstUser: args.firstUser ? true : false, // First user param will be set to undefined if it's invalid.
      }
      r.email = r.email ? r.email.trim().toLowerCase() : r.email; // clean up the email and standardize it to lower case.
      if (!error) {
        error = !r.email ? CONSTANTS.ERROR.MISSING_PARAMETER + 'email is required.' : error;
        error = r.email && r.email.length > 256 ? CONSTANTS.ERROR.EXCEEDED_STRING_LENGTH + 'email address is limited to 256 characters.' : error;
        error = !r.username ? CONSTANTS.ERROR.MISSING_PARAMETER + 'username is required.' : error;
        error = r.username && r.username.length > 128 ? CONSTANTS.ERROR.EXCEEDED_STRING_LENGTH + 'username is limited to 128 characters.' : error;
        error = r.password && r.password.length > 64 ? CONSTANTS.ERROR.EXCEEDED_STRING_LENGTH + 'password is lited to 64 characters.' : error;
        // status will always be valid. Defaults to ACTIVE.
      }
      if (!error) { // Make sure the email is unique
        error = await validate_email(r.email);
      }
      if (!error && r.roles) { // Make sure the roles parameter represents valid roles, if present.
        r = await validate_roles_wrapper(r);
      }
      break;
    case 'editAutobiography':
      r = {
        id: args.id ? args.id : null,
        autobiography: args.autobiography ? args.autobiography : null,
      };
      error = !r.id ? CONSTANTS.ERROR.MISSING_PARAMETER + 'id is required.' : error;
      error = !r.autobiography ? CONSTANTS.ERROR.MISSING_PARAMETER + 'autobiography is required.' : error;
      break;
    case 'editProfilePicture':
      r = {
        id: args.id ? args.id : null,
        profilePicture: args.profilePicture ? args.profilePicture : null,
      };
      error = !r.id ? CONSTANTS.ERROR.MISSING_PARAMETER + 'id is required.' : error;
      error = !r.autobiography ? CONSTANTS.ERROR.MISSING_PARAMETER + 'autobiography is required.' : error;
      break;
    case 'editUser':
      r = {
        id: args.id ? args.id : null, // required
        username: args.username ? args.username : undefined, // optional
        password: args.password ? args.password : undefined, // optional
        email: args.email ? args.email : undefined, // optional
        roles: args.roles ? args.roles : undefined, // optional
        status: args.status ? args.status : undefined, // optional
      }
      error = !r.id ? CONSTANTS.ERROR.MISSING_PARAMETER + 'id is required.' : error; // Id is the only required field
      error = r.email && r.email.length > 256 ? CONSTANTS.ERROR.EXCEEDED_STRING_LENGTH + 'email address is limited to 256 characters.' : error;
      error = r.username && r.username.length > 128 ? CONSTANTS.ERROR.EXCEEDED_STRING_LENGTH + 'username is limited to 128 characters.' : error;
      error = r.password && r.password.length > 64 ? CONSTANTS.ERROR.EXCEEDED_STRING_LENGTH + 'password is limited to 64 characters.' : error;
      error = r.status && !validStatus.includes(r.status) ? CONSTANTS.ERROR.INVALID_PARAMETER + `${r.status} is not a valid status` : error;
      error = !r.username && !r.password && !r.email && !r.roles && !r.status
        ? CONSTANTS.ERROR.MISSING_PARAMETER + 'No changes are requested.' : error;
      if (!error && r.email) {
        error = await validate_email(r.email, r.id); // check for email uniqueness (ignoring target account)
      }
      if (!error && r.roles) { // Make sure the roles parameter represents valid roles, if present.
        r = await validate_roles_wrapper(r);
      }
      break;
    case 'getUser':
    case 'getUserHistory':
      r = {
        id: args.id,
      };
      error = !r.id ? CONSTANTS.ERROR.MISSING_PARAMETER + 'id is required.' : error; // Id is the only required field
      break;
    case 'getUsers': // No params required. Having a user account is enough.
      break;
    case 'resetPassword': // Needs an email
      r = {
        resetCode: args.resetCode,
        password: args.password,
      };
      error = !r.resetCode ? CONSTANTS.ERROR.MISSING_PARAMETER + 'email is required.' : error;
      error = !r.password ? CONSTANTS.ERROR.MISSING_PARAMETER + 'password is required.' : error;
      break;
    case 'requestPasswordReset': // Needs an email
      r = {
        email: args.email,
      };
      error = !r.email ? CONSTANTS.ERROR.MISSING_PARAMETER + 'email is required.' : error;
      break;
    case 'signIn': // Needs email and password. No checks for validity since nothing is being set.
      r = {
        email: args.email,
        password: args.password,
      };
      error = !r.email ? CONSTANTS.ERROR.MISSING_PARAMETER + 'email is required.' : error;
      error = !r.password ? CONSTANTS.ERROR.MISSING_PARAMETER + 'password is required.' : error;
      break;
  };
  if (error) { // set the output error if any error was found 
    r.error = generateError(error, 400); // If error is populated, generates an error with code 400.;
  }
  return r;
}

/**
 * Check for a user (other than the user checking) with the input email.
 * Returns an empty string if the email is unique.
 * Returns an error message if not.
 * 
 * This method does not check if the string is a valid email address.
 * 
 * @param {string} email An email address.
 * @param {number} id A user id.
 */
async function validate_email(email, id = 0) {
  let error = null;
  try {
    let q = 'SELECT id FROM user WHERE email=? AND id!=?';
    let result = await dbquery(q, [email, id]);
    if (result.length > 0) {
      error = generateError(`A user with the following email address already exists: ${email}.`, 400);
    }
  } catch (err) {
    log.error({ inputs: { email, id }, err: err }, 'user.validate_email');
    error = generateError('Unable to validate email. Please try again later.', 500);
  }
  return error;
}

/**
 * Calls validate_roles(), but takes the full set of validation arguments as input.
 * Updates args.roles and sets args.errors as necessary.
 * */
async function validate_roles_wrapper(args) {
  if (args.roles) { // Only run if args.roles is populated
    let result = await validate_roles(args.roles);
    args.roles = result.roles;
    args.error = result.error ? result.error : args.error;
  }
  return args;
}

/**
 * Validate and sort the contents of comma separated string of role ids.
 * Invalid roles are either roles that aren't integers, or integers that don't correspond to
 * rows within the database.
 * Returns an object { roles: "1,2,3", error: "" }
 * The returned error will be falsy (null) if the roles are valid.
 * 
 * @param {string} roles A csv string of role ids.
 */
async function validate_roles(roles) {
  let ids = CSVtoIntArray(roles);
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === NaN) { // Non number values are not valid role ids.
      return { roles: roles, error: generateError(CONSTANTS.ERROR.INVALID_PARAMETER + `"${ids[i]}" is not a valid role ID.`, 400) };
    }
  }
  ids = [...new Set(ids)]; // Remove duplicate values. (sets don't allow duplicates)
  ids.sort(); // Sort remaining ids.
  let result;
  try {
    result = await dbquery('SELECT id from role ORDER BY id ASC');
  } catch (error) {
    log.error({ inputs: roles, err: error }, 'user.validate_roles');
    return { roles: roles, error: generateError(CONSTANTS.ERROR.DB_CONNECT + 'Failed to verify roles. Please try again', 500) }
  }
  for (let i = 0, j = 0; i < ids.length; i++) {
    let matched = ids[i] === CONSTANTS.USER.ROLE_ADMIN.ID; // Admin role id is not included in the database. Check before checking dynamic role ids.
    for (j; j < result.length && !matched; j++) { // Loop while the id hasn't been found. J never resets as both arrays are sorted.
      if (ids[i] < result[j].id) break; // If current id is less than current role id, a match does not exist.
      if (ids[i] === result[j].id) matched = true; // If the ID matches, mark matched as true, terminating the loop.
    }
    if (!matched) { // current id does not correspond to a known role.
      return { roles: roles, error: generateError(CONSTANTS.ERROR.INVALID_PARAMETER + `"${ids[i]}" is not a valid role ID.`, 400) };
    }
  }
  return { roles: ids.join(','), error: null };
}

module.exports = User;