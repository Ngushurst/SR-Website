import { changePage } from '../actions/appActions';
import { Component } from 'react';
import { connect } from 'react-redux';

import { Button } from 'reactstrap';

class NavBar extends Component {
  render() {
    return <div>
      <Button disabled={ this.props.page === 'Users' } onClick={ () => changePage('Users') }>Users</Button>
      <Button disabled={ this.props.page === 'Articles' } onClick={ () => changePage('Articles') }>Articles</Button>
      <Button disabled={ this.props.page === 'Pages' } onClick={ () => changePage('Pages') }>Pages</Button>
      <Button disabled={ this.props.page === 'Profile' } onClick={ () => changePage('Profile') }>Profile</Button>
     </div>;
  }
}

const mapStateToProps = state => ({
  page: state.app.page
});

export default connect(mapStateToProps)(NavBar);
