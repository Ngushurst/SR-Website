import {
  AUTHENTICATE_USER_FULFILLED,
  GET_USER_HISTORY_FULFILLED,
  GET_USERS_FULFILLED,
  SESSION_TIMEOUT,
  RESTORE_SESSION,
  CLEAR_APP
} from '../actions/actionTypes';

import CONSTANTS from '../constants';

const initialState = {
  user: { // logged in user
    authenticated: false,
    id: null,
    username: null,
    privileges: [], // array of privilege ids.
    roleIds: [], // array of role ids.
    roleNames: [], // array of role names.
    sessionToken: null, // session token used for API authorization.
  },
  users: null, // list of users for display.
  userHistory: null, // history of a single user.
};

export default function reducer(state = initialState, action) {
  let user;
  switch (action.type) {
    case AUTHENTICATE_USER_FULFILLED:
      user = {
        authenticated: true,
        ...action.payload
      };
      delete user.message;
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE.USER, JSON.stringify(user));
      return {
        ...state,
        user: user,
      }
    case CLEAR_APP:
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE.USER, null);
      return {
        ...state,
        ...JSON.parse(JSON.stringify(initialState))
      }
    case GET_USER_HISTORY_FULFILLED:
      return {
        ...state,
        userHistory: action.payload,
      }
    case GET_USERS_FULFILLED:
      return {
        ...state,
        users: action.payload,
      }
    case SESSION_TIMEOUT:
      user = JSON.parse(JSON.stringify(initialState.user));
      localStorage.setItem(CONSTANTS.LOCAL_STORAGE.USER, JSON.stringify(user));
      return {
        ...state,
        user: user
      }
    case RESTORE_SESSION: // get the session token from the preview session if present.
      user = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE.USER));
      if (user) {
        return {
          ...state,
          user: user,
        }
      } else {
        return state;
      }
    default:
      return state;
  }
}
