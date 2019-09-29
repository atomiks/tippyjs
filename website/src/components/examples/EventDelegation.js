import React from 'react';
import Tippy from '../Tippy';
import {Button} from '../Framework';

function EventDelegation() {
  return (
    <Tippy target=".child" ignoreAttributes={false}>
      <div id="parent">
        <Button className="child" data-tippy-content="Tooltip 1">
          One
        </Button>
        <Button
          className="child"
          data-tippy-content="Tooltip 2"
          data-tippy-arrow="true"
        >
          Two
        </Button>
        <Button
          className="child"
          data-tippy-content="Tooltip 3"
          data-tippy-theme="light"
        >
          Three
        </Button>
      </div>
    </Tippy>
  );
}

export default EventDelegation;
