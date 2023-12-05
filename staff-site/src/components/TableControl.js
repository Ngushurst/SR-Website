import React, { Component } from 'react';
//import { setTableView, updateTableView } from '../actions/viewActions';
import CONSTANTS from '../constants';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import gear from '../images/gear.png';
import filter from '../images/filter.png';
import { Button, ButtonGroup, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Input } from 'reactstrap';
import TableControlButtons from './TableControlButtons';

/*
* TableControl Properties:
*   btns = array, an array of objects that defines what buttons to display for no selection, should include:
*     name = string, the name to be displayed on the button, e.g., "Delete"
*     onClick = function, the function to be called when the button is clicked
*     onClickArgs = array, an array of arguments to be passed back to the onClick function. Use "TABLE_SELECTION" to have
*       a callback function returned in order to get the currently selected rows in the table.
*     title = string, a tooltip string to be displayed on the button
*   cols = array, an array of columns, should include:
*     dataField = string, a unique string identifying the column, e.g., "id", "name", etc. Note, "id" field is required.
*     hidden = boolean, controls whether the column is displayed or not (if hidden, can be shown by toggling on)
*     noshow = boolean, don't ever show the column (i.e., can't be toggled on by the user)
*     sort = boolean, controls whether the column is sortable or not
*     text = string, the string to display for the column, e.g., "ID", "Name", etc.
*   data = array, an array of data to be displayed in the table, where the data is structured as a <dataField>: <value>
*     pair, e.g., "id": 1, "name": "John Doe", etc. The dataField value should match the value in the cols array.
*   headerText = text to be displayed at the top left of the table. If supplied, the headerText will be displayed instead
*     of btns or selectBtns. The table can either have headerText, or buttons, but not both.
*   id = string, a unique string for persisting the table display settings
*   keyField = the field to use as a unique key for each row, defaults to "id" if not supplied
*   selectBtns = array, an array of objects that defines what buttons to display for selection, should include:
*     name = string, the name to be displayed on the button, e.g., "Delete"
*     onClick = function, the function to be called when the button is clicked
*     onClickArgs = array, an array of arguments to be passed back to the onClick function. Use "TABLE_SELECTION" to have
*       a callback function returned in order to get the currently selected rows in the table.
*     title = string, a tooltip string to be displayed on the button
*   showCols = boolean, controls whether column toggler is displayed or not
*   showFilter = boolean, controls whether filter button is displayed or not
*   showSelect = boolean, controls whether a checkbox selection column is added to the table or not
 *  view = Object. {cols: cols, id: this.props.id, showFilter: false}
*/
class TableControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDropdown: false,
      columnsHidden: [],
    }
  }

  componentDidMount() {
  }

  getSelection() {
    return this.node.selectionContext.selected;
  }

  handleToggleCol(colId) {
    //this.props.dispatch(updateTableView({colId: colId, id: this.props.id}));
  }

  handleToggleDropdown(e) {
    if (e.currentTarget.name !== 'columnToggle') {
      this.setState({ showDropdown: !this.state.showDropdown });
    }
  }

  handleToggleFilter() {
    let cols = this.props.cols.slice(0); // ignore actions column
    if (this.props.showFilter) {
      for (let i=0;i<cols.length;i++) {
        if (typeof cols[i].filterFn === 'function') {
          cols[i].filterFn('');
        }
      }
      for (let i=0;i<cols.length;i++) {
        delete cols[i].filter;
        delete cols[i].filterFn;
      }
    } else {
      for (let i=0;i<cols.length;i++) {
        cols[i].filter = textFilter({getFilter: (filter) => {cols[i].filterFn = filter;}});
      }
    }
    //let view = {...v, cols: cols, showFilter: !v.showFilter};
    //this.props.dispatch(setTableView(view));
  }

  onRowSelection(selection, isSelected, row={}) {
   //dead method? (does not appear to be used)
  }

  render() {
    /* Set up the table controls. */
    let filterBtn = '';
    if (this.props.showFilter) {
      filterBtn =
        <Button className='TableControlButton' title='Toggle Filter' onClick={()=>this.handleToggleFilter()}>
        <img src={filter} height={CONSTANTS.APP.BUTTON.HEIGHT} width={CONSTANTS.APP.BUTTON.WIDTH} alt='Filter'/>
        </Button>;
    }
    let columnToggler = '';
    if (this.props.showCols && this.props.cols) {
      let c = this.props.cols, colItems = [];
      for (let i=0;i<c.length;i++) {
        if (!c[i].noshow) { 
          colItems.push(
            <DropdownItem key={i} name='columnToggle'>
              <Input 
              onClick={()=>this.handleToggleCol(i)}
              type='checkbox' 
              value={c[i].id}
              defaultChecked={!c[i].hidden} /> {c[i].text}
            </DropdownItem>);
        }
      }
      columnToggler = 
        <Dropdown title='Toggle Columns' isOpen={this.state.showDropdown} toggle={this.handleToggleDropdown.bind(this)}>
          <DropdownToggle className='TableControlButton' caret>
          <img src={gear} height={CONSTANTS.APP.BUTTON.HEIGHT} width={CONSTANTS.APP.BUTTON.WIDTH} alt='Columns'/>
          <faGear />
          </DropdownToggle>
          <DropdownMenu right>
            {colItems}
          </DropdownMenu>
        </Dropdown>;
    }
    let btnsRight = '';
    if (filterBtn || columnToggler) {
      btnsRight =
        <ButtonGroup role='group' className='float-right'>
          {filterBtn}
          {columnToggler}
        </ButtonGroup>;
    }
    let btnsLeft = 
      <TableControlButtons
      btns={this.props.btns}
      getSelection={this.getSelection.bind(this)}
      selectBtns={this.props.selectBtns}
      />;
    let textLeft = this.props.headerText ? <div className='TableHeader'>{this.props.headerText}</div> : '';
    let headerLeft = textLeft ? textLeft : btnsLeft;
    let tableControls = '';
    if (this.props.headerText || this.props.btns || this.props.selectBtns || btnsRight) {
      tableControls =
        <div className='ButtonGroup clearfix'>
          {headerLeft}
          {btnsRight}
        </div>;
    }
    /* Set up the table. */
    let table = null;
    if (this.props.cols) {
      let selectRow = {
        mode: 'checkbox',
        clickToSelect: this.props.showSelect,
        hideSelectColumn: !this.props.showSelect,
        onSelect: (row, isSelect, rowIndex, e) => {this.onRowSelection('Row', isSelect, row)},
        onSelectAll: (isSelect, rows, e) => {this.onRowSelection('All', isSelect)}
      };
      const keyField = this.props.keyField ? this.props.keyField : 'id';
      table = 
        <BootstrapTable 
        ref={ n => this.node = n }
        bootstrap4 
        striped 
        condensed 
        id={this.props.id}
        key={this.props.id}
        keyField={keyField}
        columns={this.props.cols} 
        data={this.props.data} 
        filter={filterFactory()}
        selectRow={selectRow} />
    }
    return (
      <div>
        {tableControls}
        {table}
      </div>
    );
  }
}

export default TableControl;
