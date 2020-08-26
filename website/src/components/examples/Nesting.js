import React from 'react';
import {css} from '@emotion/core';
import Tippy from '../Tippy';
import {Button} from '../Framework';

const padding = css`
  padding: 10px;
`;

const commonProps = {
  onCreate({popper}) {
    popper.style.width = 'max-content';
  },
  interactive: true,
  theme: 'light-border',
  css: padding,
};

function Nesting() {
  return (
    <Tippy
      {...commonProps}
      content={
        <Tippy
          {...commonProps}
          content={
            <Tippy
              {...commonProps}
              placement="right"
              content={
                <Tippy
                  {...commonProps}
                  placement="bottom"
                  content="Level 4 (final)"
                >
                  <Button>Level 3</Button>
                </Tippy>
              }
            >
              <Button>Level 2</Button>
            </Tippy>
          }
        >
          <Button>Level 1</Button>
        </Tippy>
      }
    >
      <Button>Level 0</Button>
    </Tippy>
  );
}

export default Nesting;
