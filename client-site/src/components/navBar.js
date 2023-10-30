import { Component } from 'react';

import { Button } from 'reactstrap';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'Home'
    }
  }

  render() {
    console.log(this.props);
    return <div>
      <Button disabled={ this.props.page === 'Home' } onClick={ () => this.props.changePage('Home') }>Home</Button>
      <Button disabled={ this.props.page === 'Article' } onClick={ () => this.props.changePage('Article') }>Article</Button>
      <Button disabled={ this.props.page === 'About Us' } onClick={ () => this.props.changePage('About Us') }>About Us</Button>
      <Button disabled={ this.props.page === 'Search' } onClick={ () => this.props.changePage('Search') }>Search</Button>
     </div>;
  }
}

export default NavBar;