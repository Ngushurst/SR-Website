import { Component } from 'react';

import { /*Alert, */Container, Col, Row } from "reactstrap";

import { connect } from 'react-redux';

/*Core Pages and Components*/
import NavBar from './navBar.js'; // Application home page
import Articles from './articles.js'; // Page managing articles displayed on the website. Default Page
import Pages from './pages.js'; // Page for configuring non-article content.
import Profile from './profile.js'; // Page for changing one's profile information.
import Users from './users.js'; // Page for handling/viewing users and user roles

class App extends Component {
  /* Called when the site is opened, and no other time. Used for reading the path used to access the site.*/
  componentDidMount() {
    // check path, and set page accordingly.
    let path = window.location.pathname;
    //if (path.includes("/pending/...")) {
    //  this.props.dispatch({ type: SET_PAGE, payload: { page: "..." } });
    //}
  }

  render() {

    let page = null;

    switch (this.props.page) { // load up homepage by default
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
        {/*notification*/}
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
  page: state.app.page
});

export default connect(mapStateToProps)(App);
