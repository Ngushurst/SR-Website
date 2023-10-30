import { Component } from 'react';
import { connect } from 'react-redux';

class Users extends Component {
    render() {
        return <div>This is the Users page.</div>;
    }
}

const mapStateToProps = state => ({
    page: state.app.page
});

export default connect(mapStateToProps)(Users);
