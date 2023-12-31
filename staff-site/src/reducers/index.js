import { combineReducers } from 'redux';

import app from './appReducer.js';
import user from './userReducer.js'


// Uses the combine reducers function to merge all reducers into one master reducer for the store.
export default combineReducers({
  app,
  user,
});