const bcrypt = require('bcrypt');
const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));
const { dbquery } = require('db');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const email = require('./email')

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
   * */

  /**
   * Adds a new user to the system.
   * */
  async addUser(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Removes a user from the system.
   * */
  async deleteUser(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Changes the metadata surrounding a user account.
   * Can additionally alter/create the user's autobiography.
   * */
  async editUser(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Retrieves the account details of a user account,
   * including the user's autobiography.
   * */
  async getUser(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets the account details of all users known to the system.
   * */
  async getUsers(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Gets the history of a user account.
   * */
  async getUserHistory(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Generates a reset code for the specified user account
   * and sends the user an email.
   * */
  async requestPasswordReset(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }

  /**
   * Changes user's password without requiring authentication
   * if the correct code is provided.
   * */
  async resetPassword(req, res) {
    res.status(501).json({ message: 'Not implemented' });
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

async function validate(args) {
  return {};
}

module.exports = User;