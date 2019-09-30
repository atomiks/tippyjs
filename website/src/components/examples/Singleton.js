import React from 'react';
import Tippy, {TippySingleton} from '../Tippy';
import {Button} from '../Framework';

const array = Array(4).fill();

function Singleton({group, transition}) {
  const updateDuration = transition ? 300 : 0;
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
      updateDuration={updateDuration}
      flipOnUpdate={true}
      delay={delay}
    >
      {children}
    </TippySingleton>
  );
}

export default Singleton;
