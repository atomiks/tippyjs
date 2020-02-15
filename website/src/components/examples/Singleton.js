import React from 'react';
import Tippy, {TippySingleton} from '../Tippy';
import {Button} from '../Framework';

const array = Array(4).fill();

function Singleton({group, transition}) {
  const delay = transition ? [100, 500] : 500;

  const children = array.map((_, i) => (
    <Tippy key={i} content={`Tooltip ${i + 1}`} delay={delay}>
      <Button>Text</Button>
    </Tippy>
  ));

  return !group ? (
    children
  ) : (
    <TippySingleton
      moveTransition={
        transition ? 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)' : ''
      }
      delay={delay}
    >
      {children}
    </TippySingleton>
  );
}

export default Singleton;
