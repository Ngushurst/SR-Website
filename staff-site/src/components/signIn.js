import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addUser, requestPasswordReset, resetPassword, signIn } from '../actions/userActions';
import { Form, Input, Button, Alert } from 'reactstrap';
import logo from '../images/summit_logo.jpg';
import '../css/signIn.css'; // This css is only used here.
import { setNotification, hideNotification } from '../actions/appActions';

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '', // An error can be displayed if there are missing parameters.
      firstUser: null, // Can store { username, password }
      forgotPassword: false, // Whether to display "forgot password" form
      message: '', // A message can be displayed 
    }
  }

  /**
   * Return to the regular sign in form.
   * @param {any} e
   */
  handleBack(e) {
    e.preventDefault();
    this.setState({ forgotPassword: false, message: '', error: '' });
  }

  /**
   * Submit a form for creating the first user.
   * @param {any} e
   */
  handleFirstUser(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const confirmEmail = document.getElementById('confirmEmail').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    if (!username) {
      setNotification('Username is required.');
    } else if (!email) {
      setNotification('Email is required.');
    } else if (email !== confirmEmail) {
      setNotification('Email and Confirm Email must match.');
    } else if (!password) {
      setNotification('Password is required.');
    } else if (password !== confirmPassword) {
      setNotification('Password and Confirm Password must match.');
    } else {
      let p = this.props.dispatch(addUser(username, email, '', this.state.firstUser, password));
      p.then(
        result => {
          let info = 'Your administrator account has been successfully created. You may now sign in.';
          this.setState({
            firstUser: false,
            message: info,
            error: null
          });
        }
      );
    }
  }

  /**
   * Handler for when you click the "Forgot password" button.
   * @param {any} e Event data from triggering this handler.
   */
  handleForgot(e) {
    e.preventDefault();
    this.setState({ forgotPassword: true, message: 'Enter your email and click Submit to request a password reset.' });
  }

  /**
   * Handles 
   * @param {any} mode
   * @param {any} e
   */
  handleReset(mode, e) {
    e.preventDefault();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    if (!password) {
      setNotification('Password is required.');
    } else if (!confirmPassword) {
      setNotification('Confirm Password is required.');
    } else if (password !== confirmPassword) {
      setNotification('Password and Confirm Password must match.');
    } else {
      let p = this.props.dispatch(resetPassword(this.props.code, password));
      p.then(
        result => {
          resetUrl();
          let msg = '';
          if (mode === 'reset') {
            msg = 'Password was successfully reset. You may now sign in.';
          } else {
            msg = 'Account was successfully created. You may now sign in.';
          }
          this.setState({
            error: null, // Clear error (if present)
            forgotPassword: false, // return to regular signIn form
            info: msg // Display message
          });
        },
        error => { this.setState({ error: error }); }
      );
    }
  }

  /**
   * Handler for when the user submits the password reset form (email required).
   * @param {any} e
   */
  handleResetRequest(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) {
      this.setState({ error: 'Email is required.' });
    } else {
      let p = this.props.dispatch(requestPasswordReset(email));
      p.then(
        result => {
          this.setState({
            error: '',
            forgotPassword: false,
            info: 'Reset request successful. Please check your Email to reset your password.'
          });
        },
      );
    }
  }

  handleSignin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!email) {
      setNotification('Email is required.');
    } else if (!password) {
      setNotification('Password is required.');
    } else {
      let p = this.props.dispatch(signIn(email, password));
      p.then(
        result => { },
        error => {
          if (error === 'first_user') { // The error response is special if the right login is provided and no users are in the system.
            let message = 'Welcome to the Staff Site! To get started, please create an administrator.';
            this.setState({ firstUser: { email, password }, message: message }); // Store special login info to send to the server.
          } else { // Error will be undefined if the server can't be reached. Use placeholder message instead.
            setNotification(error ? error : 'Unable to log in. Please try again later.');
          }
        }
      );
    }
  }

  render() {
    const notification = this.props.notification.visible ?
      <Alert
        className='AppAlert'
        color={this.props.notification.type}
        isOpen={this.props.notification.visible}
        toggle={hideNotification}>
        {this.props.notification.text}
      </Alert> : null;
    const url = window.location.pathname;
    const reset = url.includes('/reset/') ? true : false; // User is resetting their password.
    const welcome = url.includes('/welcome/') ? true : false; // User is setting their password for the first time.
    const error = this.state.error ? <Alert className='SigninAlert' color='danger'>{this.state.error}</Alert> : '';
    let message = this.state.message ? <Alert className='SigninAlert' color='success'>{this.state.message}</Alert> : '';
    let form = [];
    if (this.state.firstUser) { // Setting up the first user after submitting the default login info.
      message = <Alert className='SigninAlert' color='info'>{this.state.message}</Alert>;
      form.push(<Input type='text' key='11' name='username' id='username' placeholder='Username' autoFocus />);
      form.push(<Input type='text' key='12' name='email' id='email' placeholder='Email' />);
      form.push(<Input type='text' key='13' name='confirmEmail' id='confirmEmail' placeholder='Confirm Email' />);
      form.push(<Input type='password' key='14' name='password' id='password' placeholder='Password' />);
      form.push(<Input type='password' key='15' name='confirmPassword' id='confirmPassword' placeholder='Confirm Password' />);
      form.push(<br key='18' />);
      form.push(<Button className='SigninButton' key='19' block size='lg' type='submit' onClick={this.handleFirstUser.bind(this)}>Submit</Button>);
    } else if (reset || welcome) { // Setting a password with a code. Same process for new user and existing users.
      let mode = reset ? 'reset' : 'welcome';
      let msg = '';
      if (reset) {
        msg = 'To reset your password, please enter a new password and click Submit.';
      } else {
        msg = 'Welcome to the Summit Reviews Staff Site! To get started, please create a password to set up your account.';
      }
      message = <Alert className='SigninAlert' color='info'>{msg}</Alert>;
      form.push(<Input type='password' key='1' name='password' id='password' placeholder='Password' />);
      form.push(<Input type='password' key='2' name='confirmPassword' id='confirmPassword' placeholder='Confirm Password' />);
      form.push(<br key='3' />);
      form.push(<Button className='SigninButton' key='4' block size='lg' type='submit' onClick={(e) => this.handleReset(mode, e)}>Submit</Button>);
    } else if (this.state.forgotPassword) { // Forgot password (submit email to send reset link)
      message = <Alert className='SigninAlert' color='info'>{this.state.message}</Alert>;
      form.push(<Input className='SigninInput' key='11' type='email' name='email' id='email' placeholder='Email' autoFocus />);
      form.push(<Button className='SigninForgotLink' key='12' color='link' onClick={this.handleBack.bind(this)}>Back to Sign In</Button>);
      form.push(<Button className='SigninButton' key='13' block size='lg' type='submit' onClick={this.handleResetRequest.bind(this)}>Submit</Button>);
    } else { // Signing in regularly
      form.push(<Input className='SigninInput' key='21' type='email' name='email' id='email' placeholder='Email' autoFocus />);
      form.push(<Input type='password' key='22' name='password' id='password' placeholder='Password' />); // pasword type inputs obscure their text
      form.push(<Button className='SigninForgotLink' key='23' color='link' onClick={this.handleForgot.bind(this)}>Forgot Password?</Button>);
      form.push(<Button className='SigninButton' key='24' block size='lg' type='submit' onClick={this.handleSignin.bind(this)}>Sign In</Button>);
    }
    return (
      <div className='Signin'>
        { notification }
        <div className='SigninHeader'>
          <img src={logo} className='SigninLogo' alt='Logo' />
          <div className='SigninName'>Staff Site</div>
        </div>
        {message}
        {error}
        <Form>
          {form}
        </Form>
      </div>
    );
  }
}


function resetUrl() {
  let url = window.location.protocol + '//' + window.location.hostname;
  if (window.location.port) {
    url += ':' + window.location.port;
  }
  window.history.pushState(null, '', url);
}

const mapStateToProps = state => ({
  notification: state.app.notification
});

export default connect(mapStateToProps)(SignIn);
