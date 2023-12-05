import React, { Component } from 'react';
import { connect } from 'react-redux';
import { restoreSession } from '../actions/appActions';
import Main from './main';
import SignIn from './signIn';
import CONSTANTS from '../constants';

/**
 * A class wrapping the main website. Will display the signin screen
 * if the user is not logged in. Will display main otherwise.
 * */
class App extends Component {
  componentDidMount() {
    let user = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE.USER));
    if (user) { // If there is evidence of a previous session, try to restore it.
      restoreSession();
    }
  }

  render() {
    // Check for a url navigation.
    let code = '';
    if (this.props.match.path !== '/') { // If the path has a password reset code.
      if (this.props.match.path.includes('/signin/reset/')) {
        code = this.props.match.params.code; // Pull that out and pass it to the sign in page.
      }
    }
    // Render the app or signin page.
    // Basically, check authentication, and go to signin if not logged in.
    return this.props.authenticated ? <Main /> : <SignIn code={code} />;
  }
}

const mapStateToProps = state => ({
  authenticated: state.user.user.authenticated,
});

export default connect(mapStateToProps)(App);
