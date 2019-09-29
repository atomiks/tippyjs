import React, {useState, useRef} from 'react';
import Tippy from '../Tippy';
import {Button} from '../Framework';
import TippyTransition from '../TippyTransition';

function DimensionsTransition() {
  const [display, setDisplay] = useState('none');
  const [expanded, setExpanded] = useState(false);
  const imageContainerRef = useRef();

  function onClick() {
    setExpanded(expanded => !expanded);
    setDisplay(display => (display === 'none' ? 'block' : 'none'));
  }

  function onChange(instance) {
    if (!instance.state.isVisible) {
      return;
    }

    imageContainerRef.current.style.display = 'block';
  }

  return (
    <TippyTransition onChange={onChange}>
      <Tippy
        content={
          <>
            <Button onClick={onClick} style={{margin: 10, width: 140}}>
              {expanded ? 'Close' : 'Open'} Image
            </Button>
            <div
              className="TippyTransition-image"
              style={{display}}
              ref={imageContainerRef}
            >
              <img
                style={{
                  width: 300,
                  marginTop: 5,
                  transform: 'scale(1.1)',
                  transformOrigin: 'top',
                }}
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                alt="Starry mountain landscape"
              />
            </div>
          </>
        }
        interactive={true}
        flipOnUpdate={true}
        arrow={false}
        animation="fade"
        trigger="click"
      >
        <Button>Image transition (click)</Button>
      </Tippy>
    </TippyTransition>
  );
}

export default DimensionsTransition;
