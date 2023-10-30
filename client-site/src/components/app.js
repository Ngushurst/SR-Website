import { Component } from 'react';

import { /*Alert, */Container, Col, Row } from "reactstrap";

/*Core Pages and Components*/
import NavBar from './navBar.js'; // Application home page
import Article from './article.js';
import AboutUs from './aboutUs.js';
import Search from './search.js';
import Home from './home.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'Home'
    }

    this.changePage = this.changePage.bind(this);
  }

  /* Action handler used to change the page */
  changePage(pagename) {
    this.setState({ page: pagename });
  }

  /* Called when the site is opened, and no other time. Used for reading the path used to access the site.*/
  componentDidMount() {
    // check path, and set page accordingly.
    //let path = window.location.pathname;
    //if (path.includes("/pending/...")) {
    //  this.props.dispatch({ type: SET_PAGE, payload: { page: "..." } });
    //}
  }

  render() {

    let page = null;

    switch (this.state.page) { // load up homepage by default
      case 'AboutUs':
        page = <AboutUs />;
        break;
      case 'Search':
        page = <Search />;
        break;
      case 'Article':
        page = <Article />;
        break;
      default: page = <Home />;
    }

    return (
      <div className="App">
        {/*dlg*/}
        {/*notification*/}
        <Container fluid>
          <Row>
            <Col className="Content" sm={{ size: 12 }} >
              <NavBar page={this.state.page} changePage={this.changePage} />
              {page}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

}

export default App;
