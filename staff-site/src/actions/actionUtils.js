/**
 * A number of utility functions used to help out with sending common
 * actions without repeating code.
 **/

import { SESSION_TIMEOUT } from "./actionTypes";
import { setNotification } from './appActions';
import store from "../store";

/**
 * Handles an error from the server by taking the error response from the server
 * and either displaying an error notification in the event of code 500 or
 * the login screen in the case of code 440.
 * 
 * The defaultAction is the action that will be sent to the redux store if the
 * code is not recognized.
 */
export function errorResponse(err, showNotification = true) {
	let status = err.response ? err.response.status : 500;
	let payload = err.response ? err.response.data.message : '';
	switch (status) {
		case 440: // Session timeout response.
			if (showNotification) {
				setNotification('Session timed out.');
			}
			store.dispatch({ type: SESSION_TIMEOUT, payload: payload });
			break;
		// All Other error codes are handled by the default response (set notification).
		//case 500: // internal server error
		//case 404: // resource not found
		//case 403: // forbidden
		//case 401: // unauthorized
		//case 400: // bad inputs
		default:
			if (showNotification) {
				return setNotification(payload ? payload : 'Aw, snap! Something went wrong!');
      }
	}
}