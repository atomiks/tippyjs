import React, {cloneElement} from 'react';
import Tippy, {useSingleton} from '../Tippy';
import {Button} from '../Framework';
import {Children} from 'react';

const array = Array(4).fill();

function Singleton({group, transition}) {
  const [source, target] = useSingleton();
  const delay = transition ? [100, 500] : 500;

  const children = array.map((_, i) => (
    <Tippy key={i} content={`Tooltip ${i + 1}`} delay={delay}>
      <Button>Text</Button>
    </Tippy>
  ));

  const sourceElement = (
    <Tippy
      singleton={source}
      delay={delay}
      moveTransition={
        transition ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : ''
      }
    />
  );

  if (group) {
    return (
      <>
        {sourceElement}
        {Children.map(children, (child) =>
          cloneElement(child, {singleton: target})
        )}
      </>
    );
  }

  return (
    <>
      {sourceElement}
      {children}
    </>
  );
}

export default Singleton;
