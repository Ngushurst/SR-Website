const CONSTANTS = {
  ACTION: { // A list of actions that can be performed on elements in the system. 
    ADD: "Add", // Adding a new entry.
    DELETE: "Delete", // Removing an existing entry.
    EDIT: "Edit", // Changing an existing entry.
    HIDE: "Hide", // Hiding an article so that it can only be seen by staff members.
    MOVE: "Move", // Moving an article to a different category.
    PUBLISH: "Publish", // Making an article visible to the client.
    REORDER: "Reorder", // Changes to the order (exclusively) of a category.
    REQUEST_PUBLISH: "Request Publish", // Requesting that an article be published.
    RESET_PASSWORD: "Reset Password", // Reseting the user's password using a password reset code.
  },
  APP_SERVER: {
  },
  ERROR: { // Commonly occurring errors. Message stubs are stored here to standardize outputs.
    DB_CONNECT: 'Failed to connect to the database: ',
    EXCEEDED_STRING_LENGTH: 'Field exceeded string length: ',
    MISSING_PARAMETER: 'Missing parameter: ',
    NO_ADMINS: 'Action rejected, as it would remove the last active admin.',
    NOT_AUTHORIZED: 'Not Authorized: ',
    INVALID_PARAMETER: 'Invalid parameter: ',
    INVALID_ACTION: 'Invalid action: ',
  },
  FILE_STORE_TYPES: { // Supported file store types.
    ONPREM: 'onprem',
  },
  PRIVILEGES: { // Privileges recognized by the system that can be assigned to users.
    ALL: {
      ID: 0,
      TITLE: 'All Privileges',
      DESCRIPTION: 'Admins have all privileges defined in the system, plus a bit extra.'
    },
    EDIT_USERS: {
      ID: 1,
      TITLE: 'Edit Users',
      DESCRIPTION: 'Enables the user to add users, activate/deactivate users, and manually change some information associated with accounts (email, username).'
    }, // Note: users without roles can set only edit their account.
    EDIT_ROLES: {
      ID: 2,
      TITLE: 'Edit Roles',
      DESCRIPTION: 'Enables the user to edit the permissions associated with user roles and define new roles. The user can assign roles to user accounts if they also have the "Edit Users" privilege.'
    },
    EDIT_ARTICLE: {
      ID: 3,
      TITLE: 'Edit Article',
      DESCRIPTION: 'Enables a user to add new articles and edit/move unpublished articles that they own.'
    },
    EDIT_ALL_ARTICLES: {
      ID: 4,
      TITLE: 'Edit All Articles',
      DESCRIPTION: 'Enables a user to add new articles and edit/move all unpublished articles.'
    },
    DELETE_ARTICLES: {
      ID: 5,
      TITLE: 'Delete Articles',
      DESCRIPTION: 'Enables a user to delete any unpublished article.'
    },
    PUBLISH_ARTICLES: {
      ID: 6,
      TITLE: 'Publish Articles',
      DESCRIPTION: 'Enables a user to publish/hide any article they are allowed to edit. Extends actions (edit, move, delete) to published articles.'
    },
    EDIT_CATEGORIES: {
      ID: 7,
      TITLE: 'Edit Categories',
      DESCRIPTION: 'Enables a user to edit article categories. Article categories correspond directly to client website UI.'
    },
    EDIT_PAGES: {
      ID: 8,
      TITLE: 'Edit Users',
      DESCRIPTION: 'Enables a user to view and edit the settings on the “Pages” page to adjust non-article content on the website.'
    }
  },
  USER: {
    FIRST_USER: { // Email and password needed to setup the first user.
      EMAIL: 'pending',
      PASSWORD: 'pending',
    },
    SECURITY: { // The amount of salt to add to each password. Add too much and you'll spoil the performance.
      SALT_ROUNDS: 1,
    },
    ROLE_ADMIN: { // Description of the admin role. Able to perform all actions on the server.
      ID: 0,
      NAME: 'Administrator',
    },
    STATUS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
    }
  }
};

module.exports = CONSTANTS;