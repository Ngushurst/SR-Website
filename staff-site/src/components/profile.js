import { Component } from 'react';
import { connect } from 'react-redux';

class Profile extends Component {
    render() {
        return <div>This is the Profile page.</div>;
    }
}

const mapStateToProps = state => ({
    page: state.app.page
});

export default connect(mapStateToProps)(Profile);
