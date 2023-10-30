import { Component } from 'react';
import { connect } from 'react-redux';

class Pages extends Component {
    render() {
        return <div>This is the Pages page.</div>;
    }
}

const mapStateToProps = state => ({
    page: state.app.page
});

export default connect(mapStateToProps)(Pages);
