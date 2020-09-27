import React from 'react';
import './App.css';

function Material(props) {

  function clickHandler(event) {
    if(props.selectMe !== undefined) {
        props.selectMe(event.target);
    }
  }
  let css_classes = [props.color, props.shape, 'Material'].join(' ');
  return (
    <div className={css_classes} id={props.id} onClick={clickHandler}>
        {props.children}
    </div>
  );
}

export default Material;
