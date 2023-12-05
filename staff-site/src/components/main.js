import { Component } from 'react';
import { Alert, Container, Col, Row } from "reactstrap";
import { connect } from 'react-redux';

/*Core Pages and Components*/
import NavBar from './navBar.js'; // Application home page
import Articles from './articles.js'; // Page managing articles displayed on the website. Default Page
import Pages from './pages.js'; // Page for configuring non-article content.
import Profile from './profile.js'; // Page for changing one's profile information.
import SignIn from './signIn'; // Page for changing one's profile information.
import Users from './users.js'; // Page for handling/viewing users and user roles

import { hideNotification } from '../actions/appActions';

class Main extends Component {
  /* Called when the site is opened, and no other time. Used for reading the path used to access the site.*/
  componentDidMount() {
    // check path, and set page accordingly.
    //let path = window.location.pathname;
    //if (path.includes("/pending/...")) {
    //  this.props.dispatch({ type: SET_PAGE, payload: { page: "..." } });
    //}
  }

  render() {
    // Show sign-in page if not authenticated.
    if (!this.props.authenticated) {
      return <SignIn />;
    }

    const notification = this.props.notification.visible ?
      <Alert
        className='AppAlert'
        color={this.props.notification.type}
        isOpen={this.props.notification.visible}
        toggle={hideNotification}>
        {this.props.notification.text}
      </Alert> : null;

    let page = null;

    switch (this.props.page.page) { // load up homepage by default
      case 'Pages':
        page = <Pages />;
        break;
      case 'Profile':
        page = <Profile />;
        break;
      case 'Users':
        page = <Users />;
        break;
      default: page = <Articles />;
    }

    return (
      <div className="App">
        {/*dlg*/}
        { notification }
        <Container fluid>
          <Row>
            <Col className="Content" sm={{ size: 12 }} >
              <NavBar/>
              {page}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

}

const mapStateToProps = state => ({
  //dlg: state.app.dlg,
  authenticated: state.user.user.authenticated,
  notification: state.app.notification,
  page: state.app.page
});

export default connect(mapStateToProps)(Main);
