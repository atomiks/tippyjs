import React, { useRef } from 'react'
import Tippy, { TippyGroup } from '../Tippy'
import { Button } from '../Framework'

const array = Array(3).fill()

function Nesting() {
  const currentlyOpenNestedTippyRef = useRef()

  return (
    <Tippy
      theme="light-border"
      interactive={true}
      arrow={true}
      onHide={() => {
        if (currentlyOpenNestedTippyRef.current) {
          currentlyOpenNestedTippyRef.current.hide()
        }
      }}
      content={
        <div style={{ marginTop: 8, marginLeft: 8 }}>
          <TippyGroup delay={[200, 500]}>
            {array.map((_, i) => (
              <Tippy
                key={i}
                animation="fade"
                arrow={true}
                onMount={instance => {
                  currentlyOpenNestedTippyRef.current = instance
                }}
              >
                <Button>Text</Button>
              </Tippy>
            ))}
          </TippyGroup>
        </div>
      }
    >
      <Button>Text</Button>
    </Tippy>
  )
}

export default Nesting
