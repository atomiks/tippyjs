import React from 'react';
import Tippy from '../Tippy';
import styled from 'styled-components';
import {Button} from '../Framework';

const Square = styled(Button)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 280px;
  height: 200px;
  font-weight: bold;
  font-size: 24px;
  left: 50%;
  transform: translateX(-50%);
`;

function Multiple() {
  return ['top', 'right', 'bottom', 'left']
    .reduce(
      (acc, basePlacement) =>
        acc.concat(
          basePlacement,
          `${basePlacement}-start`,
          `${basePlacement}-end`,
        ),
      [],
    )
    .reduce(
      (acc, placement) => (
        <Tippy
          content={placement}
          placement={placement}
          flip={false}
          hideOnClick={false}
        >
          {acc}
        </Tippy>
      ),
      <Square>Hover me</Square>,
    );
}

export default Multiple;
