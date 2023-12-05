import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // This allows us to change the url to change pages. Can import
                                                  // and use tags such as <route> and <link> within it.
import { Provider } from 'react-redux'; // Lets us set up the redux store for usage in keeping state consistent.
import './css/index.css'; // All css used for the site should be defined here.
import AppRouter from './components/appRouter.js';
import './css/bootstrap.min.css';
//import reportWebVitals from './reportWebVitals';

import store from './store.js';

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
