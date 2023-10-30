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
  },
  APP_SERVER: {
    SECRET: 'pending', 
  },
  ERROR: { // Commonly occurring errors. Message stubs are stored here to standardize outputs.
    DB_CONNECT: 'Failed to connect to the database: ',
    EXCEEDED_STRING_LENGTH: 'Field exceeded string length: ',
    MISSING_PARAMETER: 'Missing parameter: ',
    NO_ADMINS: 'Action rejected, as it would remove the last active admin.',
    NOT_AUTHORIZED: 'Not Authorized: ',
    INVALID_PARAMETER: 'Invalid parameter: ',
  },
  FILE_STORE_TYPES: { // Supported file store types.
    ONPREM: 'onprem',
  },
  PRIVILEGES: { // Privileges recognized by the system that can be assigned to users.
    EDIT_USERS: {
      id: 1,
      title: 'Edit Users',
      description: 'Enables the user to add users, assign roles, deactivate users, and manually change some information associated with accounts (email, username, status).'
    },
    EDIT_ROLES: {
      id: 2,
      title: 'Edit Roles',
      description: 'Enables the user to edit the permissions associated with user roles and define new roles.'
    },
    EDIT_ARTICLE: {
      id: 3,
      title: 'Edit Article',
      description: 'Enables a user to add new articles and edit/move unpublished articles that they own.'
    },
    EDIT_ALL_ARTICLES: {
      id: 4,
      title: 'Edit All Articles',
      description: 'Enables a user to add new articles and edit/move all unpublished articles.'
    },
    DELETE_ARTICLES: {
      id: 5,
      title: 'Delete Articles',
      description: 'Enables a user to delete any unpublished article.'
    },
    PUBLISH_ARTICLES: {
      id: 6,
      title: 'Publish Articles',
      description: 'Enables a user to publish/hide any article they are allowed to edit. Extends actions (edit, move, delete) to published articles.'
    },
    EDIT_CATEGORIES: {
      id: 7,
      title: 'Edit Categories',
      description: 'Enables a user to edit article categories. Article categories correspond directly to client website UI.'
    },
    EDIT_PAGES: {
      id: 8,
      title: 'Edit Users',
      description: 'Enables a user to view and edit the settings on the “Pages” page to adjust non-article content on the website.'
    }
  },
  USER: {
    FIRST_USER: { // Email and password needed to setup the first user.
      EMAIL: 'pending',
      PASSWORD: 'pending',
    },
    STATUS: {
      ACTIVE: 1,
      INACTIVE: 0,
    }
  }
};

module.exports = CONSTANTS;