import React from "react";
import { Switch, Route } from "react-router-dom";
import App from "./app";

//https://stackoverflow.com/questions/41466055/how-do-i-pass-state-through-react-router
// ^^ method of maintaining browser history.

// Add more routes as needed and the switch will move to the designated page spot.
function AppRouter() {
  return (
    <div>
      <Switch>
        <Route exact path='/' component={App} />
        <Route exact path='/c/signin/reset/:code' component={App} />
        <Route exact path='/c/signin/welcome/:code' component={App} />
      </Switch>
    </div>
  );
}

export default AppRouter;
