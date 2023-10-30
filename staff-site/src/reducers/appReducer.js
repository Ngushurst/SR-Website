
// Import some actions here.

import { SET_PAGE, CLEAR_APP } from '../actions/actionTypes';

const initialState = {
  page: "Articles"
}


/*
 * This here is a handler that catches all actions relevant to the app.
 */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PAGE:
      return {
        ...state,
        page: action.payload.page
      };

    case CLEAR_APP:
      return {
        ...state,
        page: null
      };

    default:
      return state;
  }
}