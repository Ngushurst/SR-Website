import { Component } from 'react';
import { connect } from 'react-redux';

class Article extends Component {
    render() {
        return <div>This is the Articles page.</div>;
    }
}

const mapStateToProps = state => ({
    page: state.app.page
});

export default connect(mapStateToProps)(Article);
