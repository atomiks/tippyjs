import React from 'react'
import styled from 'styled-components'
import Tippy from '../Tippy'
import { Button } from '../Framework'

const List = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;
  text-align: left;
`

const Reaction = styled.button.attrs({ role: 'menuitem' })`
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

function Dropdown({ text }) {
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
      interactive
      aria={null}
      autoFocus={false}
      animateFill={false}
      placement="bottom"
      distance={7}
      animation="fade"
      theme="light-border dropdown"
      updateDuration={0}
      trigger="mouseenter click"
      arrow
      appendTo={ref => ref.parentNode}
      onMount={tip => {
        tip.reference.setAttribute('aria-expanded', 'true')
      }}
      onHide={tip => {
        tip.reference.setAttribute('aria-expanded', 'false')
      }}
    >
      <Button aria-haspopup="true" aria-expanded="false">
        {text}
      </Button>
    </Tippy>
  )
}

Dropdown.defaultProps = {
  text: 'Dropdown',
}

export default Dropdown
