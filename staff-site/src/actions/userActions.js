import axios from 'axios';
import {
	AUTHENTICATE_USER_FULFILLED, 
	CLEAR_APP,
  GET_USER_HISTORY_FULFILLED,
  GET_USERS_FULFILLED,
  SET_NOTIFICATION,
  SET_PAGE,
} from './actionTypes';
import { errorResponse } from './actionUtils';
import store from '../store';
import { setNotification } from './appActions';
import CONSTANTS from '../constants';


/**
 * Adds a new user.
 * @param {string} username The displayed name for the user.
 * @param {string} email The user's email address. Will receive a password reset email upon account creation.
 * @param {string} roles Roles assigned to the account
 * @param {object} firstUser Only applicable if no users are registered in the system.
 * @param {string} password Only applicable for the first user.
 */
export function addUser(username, email, roles, firstUser = undefined, password = undefined) {
  return function (dispatch) {
    return new Promise(function (resolve, reject) {
      const state = store.getState();
      let url = '/admin/users';
      let data = {
        username: username,
        password: password,
        email: email,
        roles: roles
      };
      if (firstUser) { // Special handling for first user. The server will reject the request if users already exist.
        url = '/admin/users/first';
        data.firstUser = firstUser;
      }
      const config = {
        method: 'post',
        url: url,
        data: data,
        headers: { Authorization: 'Bearer ' + state.user.user.sessionToken }
      };
      axios(config)
        .then((response) => {
          setNotification(response.data.message, CONSTANTS.NOTIFICATION.TYPES.GREEN, true);
          if (!data.first_user) {
            dispatch(getUsers());
          }
          resolve(response.data.message);
        })
        .catch((err) => {
          errorResponse(err);
          reject(err.response.data.message);
        });
    });
  }
}

/**
 * Sets the user's profile picture. Can only set the autobiography for your own account.
 * @param {number} userId The user's autobiography to update.
 * @param {string} autobiography A stringified set of html representing a user's autobiography.
 */
export function editAutobiography(userId, autobiography) {
  return function (dispatch) {
    return new Promise(function (resolve, reject) {
      const state = store.getState();
      const config = {
        method: 'put',
        url: `/admin/users/${userId}/autobiography`,
        data: { id: userId, autobiography: autobiography },
        headers: { Authorization: 'Bearer ' + state.user.user.sessionToken }
      };
      axios(config)
        .then((response) => { // Report success.
          setNotification(response.data.message, CONSTANTS.NOTIFICATION.TYPES.GREEN, true);
          resolve(response.data.message);
        })
        .catch((err) => { // Display error
          errorResponse(err);
          reject(err.response.data.message);
        });
    });
  }
}

/**
 * Sets the user's profile picture. Can only set the profile picture for your own account.
 * @param {number} userId The user's autobiography to update.
 * @param {string} autobiography The new profile picture to use.
 */
export function editProfilePicture(userId, profilePicture) {
  return function (dispatch) {
    return new Promise(function (resolve, reject) {
      const state = store.getState();
      const config = {
        method: 'put',
        url: `/admin/users/${userId}/pfp`,
        data: { id: userId, profilePicture: profilePicture },
        headers: { Authorization: 'Bearer ' + state.user.user.sessionToken }
      };
      axios(config)
        .then((response) => { // Report success.
          setNotification(response.data.message, CONSTANTS.NOTIFICATION.TYPES.GREEN, true);
        })
        .catch((err) => { // Display error
          errorResponse(err);
          reject(err.response.data.message);
        });
    });
  }
}

/**
 * Edits a target user (if the user has the needed privileges) using the values provided in
 * the args object { username, password, email, roles, status }. All properties are optional,
 * though at least one must be populated.
 * @param {number} userId Target user to make changes to.
 * @param {object} args Object of form { username, password, email, roles, status }. At least one property must be populated.
 */
export function editUser(userId, args) {
  return function (dispatch) {
    return new Promise(function (resolve, reject) {
      const state = store.getState();
      const data = {
        id: userId,
        username: args.displayname,
        password: args.password,
        email: args.email,
        roles: args.roles,
        status: args.status,
      };
      const config = {
        method: 'put',
        url: `/admin/users/${userId}`,
        data: data,
        headers: { Authorization: 'Bearer ' + state.user.user.sessionToken }
      };
      axios(config)
        .then((response) => {
          setNotification(response.data.message, CONSTANTS.NOTIFICATION.TYPES.GREEN, true);
          dispatch(getUsers());
          resolve(response.data.message);
        })
        .catch((err) => {
          errorResponse(err);
          reject(err.response.data.message);
        });
    });
  }
}

/**
 * Gets the change history associated with a user's account id.
 * @param {number} userId Target account id.
 */
export function getUserHistory(userId) {
  return function (dispatch) {
    return new Promise(function (resolve, reject) {
      const state = store.getState();
      const config = {
        method: 'get',
        url: `/admin/users/${userId}/history`,
        headers: { Authorization: 'Bearer ' + state.user.user.sessionToken }
      };
      axios(config)
        .then((response) => {
          dispatch({ type: GET_USER_HISTORY_FULFILLED, payload: response.data.data });
          dispatch({ type: SET_PAGE, payload: { page: 'Users', view: 'History' } });
          resolve(response.data.message);
        })
        .catch((err) => {
          errorResponse(err);
          reject(err.response.data.message);
        });
    });
  }
}

/**
 * Gets the list of registered users within the system, including metadata like their email and roles.
 * */
export function getUsers() {
  return function (dispatch) {
    return new Promise(function (resolve, reject) {
      const state = store.getState();
      const config = {
        method: 'get',
        url: '/admin/users',
        headers: { Authorization: 'Bearer ' + state.user.user.sessionToken }
      };
      axios(config)
        .then((response) => {
          dispatch({ type: GET_USERS_FULFILLED, payload: response.data.data });
          resolve(response.data.message);
        })
        .catch((err) => {
          errorResponse(err);
          reject(err);
        });
    });
  }
}

/**
 * Requests a password reset (login not required) for the account associated
 * with the input email address. An email with a reset link will be sent to the
 * target email address.
 * @param {string} email
 */
export function requestPasswordReset(email) {
  return function(dispatch) {
    return new Promise(function (resolve, reject) {
      let config = {
        method: 'post',
        url: '/admin/users/password/reset_request',
        data: { email: email }
      };
      axios(config)
        .then((response) => {
          setNotification('Request successful. Please check your email for a reset code.', CONSTANTS.NOTIFICATION.TYPES.LIGHT_BLUE);
          resolve(response.data.message);
        })
        .catch((err) => {
          errorResponse(err);
          reject(err.response.data);
        });
    });
  }
}

/**
 * Requests a password reset using a reset code.
 * @param {string} resetCode
 * @param {string} password
 */
export function resetPassword(resetCode, password) {
  return function(dispatch) {
    return new Promise(function (resolve, reject) {
      let config = {
        method: 'post',
        url: '/admin/users/password/reset',
        data: {
          password: password,
          resetCode: resetCode
        }
      };
      axios(config)
        .then((response) => {
          dispatch({ type: SET_NOTIFICATION, payload: { text: response.data.message, type: 'info', visible: true } });
          resolve(response.data.message);
        })
        .catch((err) => {
          errorResponse(err);
          reject(err.response.data.message);
        });
    });
  }
}

/**
 * Sign into the website and get a session token from the server for use
 * in all API calls.
 * @param {string} email User email address.
 * @param {string} password User password.
 */
export function signIn(email, password) {
	return function(dispatch) {
    return new Promise(function (resolve, reject) {
      let config = {
        method: 'post',
        url: '/admin/sign_in',
        data: {
          email: email,
          password: password,
        }
      };
      axios(config).then((response) => {
        dispatch({ type: AUTHENTICATE_USER_FULFILLED, payload: response.data });
        resolve(response.data.message);
      })
        .catch((err) => { // Reject with a special message if signin meets criteria for the first user.
          if (err.response.data.firstUser) {
            reject('first_user');
          } else {
            errorResponse(err);
            reject(err.response.data.message);
          }
        });
    });
	}
}


/**
 * Clear login information and all state stored in redux.
 * */
export function signOut() {
	return function(dispatch) {
    dispatch({ type: CLEAR_APP });
	}
}