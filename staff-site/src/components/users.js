import { Component } from 'react';
import CONSTANTS from '../constants';
import { connect } from 'react-redux';
import { getUserHistory, getUsers } from '../actions/userActions';
//import * as dlg from '../actions/dlgConstants';
//import { displayDialog } from '../actions/dlgHelper';
import TableControl from './TableControl';
import { Button } from 'reactstrap';
import edit from '../images/edit.png';
import list from '../images/list.png';

class Users extends Component {
  constructor(props) {
    super(props);
    this.handleShow = this.handleShow.bind(this);
  }

  componentDidMount() {
    //get the latest list of users.
    this.props.dispatch(getUsers());
  }

  handleShow(dialog, vals, e) {
    //let d = {};
    //if (dialog === 'Add') {
    //  displayDialog(dlg.DLG_TYPE_USER, d);
    //} else if (dialog === 'Edit') {
    //  e.preventDefault();
    //  d = {
    //    actions: [{ name: dlg.DLG_ACTION_EDIT, onSubmit: dlg.DLG_USER_EDIT }],
    //    inputs: [
    //      { name: 'Display Name', value: vals.displayname },
    //      { name: 'Email', value: vals.email },
    //      { name: 'Role', value: vals.role },
    //      { name: 'Status', value: vals.status },
    //    ],
    //    inputsHidden: { id: vals.id }
    //  };
    //  displayDialog(dlg.DLG_TYPE_USER, d);
    //}
  }

  handleViewHistoryClick(vals, e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.dispatch(getUserHistory(vals.id, vals.displayname));
  }

  render() {
    if (!this.props.users) {
      return (null);
    }
    let btns = [
      {
        'name': 'Add',
        'onClick': this.handleShow,
        'onClickArgs': ['Add', {}],
        'title': 'Add User'
      }
    ];
    let cols = JSON.parse(JSON.stringify(this.props.users.cols));
    cols.unshift({ field: 'action', title: 'Actions' });
    for (let i = 0; i < cols.length; i++) {
      cols[i].hidden = (cols[i].field === 'id' || cols[i].field === 'privileges') ? true : false;
      cols[i].noshow = cols[i].hidden;
      cols[i].sort = cols[i].field === 'action' ? false : true;
      cols[i].dataField = cols[i].field;
      cols[i].text = cols[i].title;
      delete cols[i].title;
    }
    let rows = JSON.parse(JSON.stringify(this.props.users.rows));
    for (let i = 0; i < rows.length; i++) {
      rows[i].action = [];
      rows[i].action.push(
        <Button
          className='TableLinkPad'
          color='link'
          key='1'
          name='edit'
          onClick={(e) => this.handleShow('Edit', rows[i], e)}
          title='Edit'><img src={edit} height={CONSTANTS.APP.BUTTON.HEIGHT} width={CONSTANTS.APP.BUTTON.WIDTH} alt='Edit'/></Button>
      );
      rows[i].action.push(
        <Button
          className='TableLink'
          color='link'
          href='#'
          key='2'
          name='history'
          onClick={(e) => this.handleViewHistoryClick(rows[i], e)}
          title='View History'><img src={list} height={CONSTANTS.APP.BUTTON.HEIGHT} width={CONSTANTS.APP.BUTTON.WIDTH} alt='History' /></Button>
      );
    }
    return (
      <div>
        <TableControl
          btns={btns}
          cols={cols}
          data={rows}
          id='user'
          keyField='id'
          showCols={true}
          showFilter={true}
          showSelect={false}
          view={ {} }
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
    page: state.app.page,
    users: state.user.users
});

export default connect(mapStateToProps)(Users);
