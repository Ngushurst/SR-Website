import React, { Component } from "react";
import { Button, ButtonGroup } from "reactstrap";

/**
 * A cluster of table control buttons to be displayed at the top of the table control component.
 * */
class TableControlButtons extends Component {
  render() {
    let btnsLeft = "";
    if (this.props.btns) {
      let btns = [];
      let b = this.props.btns;
      for(let i=0;i<b.length;i++) {
        let args = [];
        for(let j=0;j<b[i].onClickArgs.length;j++) {
          args[j] = b[i].onClickArgs[j] === "TABLE_SELECTION" ? this.props.getSelection : b[i].onClickArgs[j];
        }
        btns.push(
          <Button key={i} className="BackButton" title={b[i].title} onClick={()=>b[i].onClick(...args)}>
            {b[i].name}
          </Button>
          );
      }
      btnsLeft = 
        <ButtonGroup role="group" className="float-left" style={{marginRight: '10px'}}>
          {btns}
        </ButtonGroup>;
    }
    let btnsSelect = "";
    if (this.props.selectBtns) {
      let btns = [];
      let b = this.props.selectBtns;
      for(let i=0;i<b.length;i++) {
        let args = [];
        for(let j=0;j<b[i].onClickArgs.length;j++) {
          args[j] = b[i].onClickArgs[j] === "TABLE_SELECTION" ? this.props.getSelection : b[i].onClickArgs[j];
        }
        btns.push(
          <Button key={i} name="select" className="BackButton" title={b[i].title} onClick={()=>b[i].onClick(...args)}>
            {b[i].name}
          </Button>
          );
      }
      btnsSelect = 
        <ButtonGroup role="group" className="float-left">
          {btns}
        </ButtonGroup>;
    }
    let tableButtons = "";
    if (btnsLeft || btnsSelect) {
      tableButtons =
        <div>
          {btnsLeft}
          {btnsSelect}
        </div>;
    }
    return (
      <div>
        {tableButtons}
      </div>
    );
  }
}

export default (TableControlButtons);
