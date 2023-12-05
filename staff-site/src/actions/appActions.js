import { HIDE_NOTIFICATION, RESTORE_SESSION, SET_NOTIFICATION, SET_PAGE } from './actionTypes';
import CONSTANTS from '../constants';
import store from '../store';

/* Action handler used to change the page */
export function changePage(pagename, view=null) {
  store.dispatch({ type: SET_PAGE, payload: { page: pagename, view: view } });
}

/**
 * Hides the active notification in the app.
 * */
export function hideNotification() {
  store.dispatch({ type: HIDE_NOTIFICATION });
}

/**
 * Pulls infomration from local storage to try to restore
 * the previous session.
 * */
export function restoreSession() {
  store.dispatch({ type: RESTORE_SESSION });
}

/**
 * Generates a text notification at the top of the page. The notification can
 * be manually dismissed and will timeout if left alone.
 * @param {string} text The message to be displayed.
 * @param {string} type Dicatates the notifcation color. Defaults to red.
 * @param {number} timeout Time(ms) before the notification dissapears. Will use a default value if not provided.
 */
export function setNotification(text, type = CONSTANTS.NOTIFICATION.TYPES.RED, timeout = null) {
  store.dispatch({ type: SET_NOTIFICATION, payload: { text, type, timeout, visible: true } });
}