import React from 'react';
import Icon from './Icon';
import Tippy from './Tippy';

import render from '../images/render.svg';

const description = 'Configured by the render() function';

function RenderIcon({large}) {
  return (
    <Tippy
      content={
        <>
          <strong>Render:</strong> {description}
        </>
      }
      placement="right"
      maxWidth="none"
      popperOptions={{
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['auto'],
            },
          },
        ],
      }}
    >
      <Icon src={render} alt={description} size={large ? 38 : 20} />
    </Tippy>
  );
}

export default RenderIcon;
