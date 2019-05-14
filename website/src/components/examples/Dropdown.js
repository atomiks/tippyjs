import React, { useState } from 'react'
import styled from 'styled-components'
import Tippy from '../Tippy'
import { Button } from '../Framework'

const List = styled.div`
  margin: 0;
  padding-left: 0;
  list-style: none;
  text-align: left;
`

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
`

const Text = styled.p`
  margin: 5px 0;
  color: #777;
`

function Dropdown({ text = 'Dropdown' }) {
  const [ariaExpanded, setAriaExpanded] = useState('false')

  return (
    <Tippy
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
      aria={null}
      interactive={true}
      arrow={true}
      animateFill={false}
      distance={7}
      placement="bottom"
      animation="fade"
      theme="light-border dropdown"
      trigger="click"
      appendTo="parent"
      onMount={() => setAriaExpanded('true')}
      onHide={() => setAriaExpanded('false')}
    >
      <Button aria-expanded={ariaExpanded}>{text}</Button>
    </Tippy>
  )
}

export default Dropdown
