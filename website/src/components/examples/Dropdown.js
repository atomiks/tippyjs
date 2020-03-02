import React, {forwardRef} from 'react';
import styled from '@emotion/styled';
import {css} from '@emotion/core';
import Tippy from '../Tippy';
import {Button} from '../Framework';

const List = styled.div`
  margin: 0;
  padding-left: 0;
  list-style: none;
  text-align: left;
`;

const Reaction = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  color: inherit;
  transition: transform 0.1s ease-out;
  transform: scale(1.0001);
  cursor: pointer;

  &:hover,
  &:focus {
    transform: scale(1.25);
  }
`;

const Text = styled.p`
  margin: 6px 0;
  color: #777;
`;

const DropdownTippy = forwardRef((props, ref) => (
  <Tippy
    css={css`
      hr {
        margin: 6px 0 10px;
      }
    `}
    ref={ref}
    {...props}
  />
));

function Dropdown({text = 'Dropdown'}) {
  return (
    <DropdownTippy
      content={
        <>
          <Text>Pick your reaction</Text>
          <hr />
          <List>
            <Reaction aria-label="React with thumbs up emoji">
              <span role="img" aria-label="Thumbs up">
                👍
              </span>
            </Reaction>
            <Reaction aria-label="React with thumbs down emoji">
              <span role="img" aria-label="Thumbs down">
                👎
              </span>
            </Reaction>
            <Reaction aria-label="React with heart emoji">
              <span role="img" aria-label="Heart">
                ❤️
              </span>
            </Reaction>
            <Reaction aria-label="React with crying with laughter emoji">
              <span role="img" aria-label="Crying with laughter">
                😂
              </span>
            </Reaction>
            <Reaction aria-label="React with party emoji">
              <span role="img" aria-label="Party">
                🎉
              </span>
            </Reaction>
          </List>
        </>
      }
      interactive={true}
      arrow={true}
      animateFill={false}
      offset={[0, 7]}
      placement="bottom"
      animation="fade"
      theme="light-border"
      trigger="click"
    >
      <Button>{text}</Button>
    </DropdownTippy>
  );
}

export default Dropdown;
