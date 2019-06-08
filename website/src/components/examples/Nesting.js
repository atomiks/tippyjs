import React, { useRef } from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'

const array = Array(3).fill()

function Nesting() {
  const parentInstanceRef = useRef()
  const currentlyOpenNestedTippyRef = useRef()

  return (
    <Tippy
      theme="light-border"
      interactive={true}
      arrow={true}
      onCreate={instance => (parentInstanceRef.current = instance)}
      onHide={() => {
        if (currentlyOpenNestedTippyRef.current) {
          currentlyOpenNestedTippyRef.current.hide()
        }
      }}
      content={
        <div style={{ marginTop: 8, marginLeft: 8 }}>
          {array.map((_, i) => (
            <Tippy
              key={i}
              animation="fade"
              arrow={true}
              onShow={instance => {
                // Prevent showing if parent isn't visible
                if (!parentInstanceRef.current.state.isVisible) {
                  return false
                } else {
                  currentlyOpenNestedTippyRef.current = instance
                }
              }}
            >
              <Button>Text</Button>
            </Tippy>
          ))}
        </div>
      }
    >
      <Button>Text</Button>
    </Tippy>
  )
}

export default Nesting
