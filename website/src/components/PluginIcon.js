import React from 'react';
import Icon from './Icon';
import Tippy from './Tippy';

import plugin from '../images/plugin.svg';

const description = 'Requires importing its plugin when using modules';

function RenderIcon({large}) {
  return (
    <Tippy
      content={
        <>
          <strong>Plugin:</strong> {description}
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
      <Icon src={plugin} alt={description} size={large ? 38 : 20} />
    </Tippy>
  );
}

export default RenderIcon;
