import { SET_PAGE } from './actionTypes';
import store from "../store";

/* Action handler used to change the page */
export function changePage(pagename) {
  store.dispatch({ type: SET_PAGE, payload: { page: pagename } });
}