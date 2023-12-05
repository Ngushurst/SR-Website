import { CLEAR_APP, HIDE_NOTIFICATION, RESTORE_SESSION, SET_NOTIFICATION, SET_PAGE, } from '../actions/actionTypes';
import store from '../store';
import CONSTANTS from '../constants';

const initialState = {
  notification: {
    type: 'danger', // notification color
    text: '', // notification contents
    timeout: 0, // time it takes for the notification to dismiss itself.
    visible: false, // whether or not the notification is displayed
  },
  page: {
    page: 'Articles', // The page to display
    view: null, // Additional information that may alter how the page is displayed (ex: history)
  }
}


/*
 * This here is a handler that catches all actions relevant to the app in general.
 * Entails page selection, notifications, and dialogs.
 */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PAGE: // Changes the page settings, resulting in new components being displayed.
      return {
        ...state,
        page: {
          page: action.payload.page,
          view: action.payload.view,
        }
      };
    case HIDE_NOTIFICATION: // Hides the active notification. Does nothing if the notification is already hidden.
      return {
        ...state,
        notification: { visible: false },
      }
    case SET_NOTIFICATION: // Sets a new notification at the top of the page.
      let timeout = action.payload.timeout;
      if (!timeout) { // Use a default timeout.
        timeout = // If red or yellow (error/warning), use error timeout. Otherwise use default timeout.
          action.payload.type === CONSTANTS.NOTIFICATION.TYPES.RED ||
          action.payload.type === CONSTANTS.NOTIFICATION.TYPES.YELLOW ?
          CONSTANTS.NOTIFICATION.DEFAULT_ERROR_NOTIFICATION_TIMEOUT :
          CONSTANTS.NOTIFICATION.DEFAULT_NOTIFICATION_TIMEOUT;
      }
      setTimeout(() => { // Hide the notification after the timeout.
        store.dispatch({ type: HIDE_NOTIFICATION })
      }, action.payload.timeout ? action.payload.timeout : CONSTANTS.NOTIFICATION.DEFAULT_NOTIFICATION_TIMEOUT);
      return {
        ...state,
        notification: action.payload,
      }
    case RESTORE_SESSION: // Restore page from previous session?
      return state;
    case CLEAR_APP: // Clears all state from the application. Returns a copy of the initial state.
      return JSON.parse(JSON.stringify(initialState));
    default:
      return state;
  }
}