import React, { useState } from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'
import TippyTransition from '../TippyTransition'
import { useThis } from '../../hooks'

function DimensionsTransition() {
  const [display, setDisplay] = useState('none')
  const [expanded, setExpanded] = useState(false)

  const $this = useThis({ isFirstChange: true })

  function onClick() {
    setExpanded(expanded => !expanded)
    setDisplay(display => (display === 'none' ? 'block' : 'none'))
  }

  function onChange(instance) {
    const { content } = instance.popperChildren
    const container = content.querySelector('.TippyTransition-image')

    if ($this.isFirstChange) {
      $this.isFirstChange = false
    } else {
      container.style.display = 'block'
    }
  }

  return (
    <TippyTransition onChange={onChange}>
      <Tippy
        content={
          <>
            <Button onClick={onClick} style={{ margin: 10, width: 140 }}>
              {expanded ? 'Close' : 'Open'} Image
            </Button>
            <div className="TippyTransition-image" style={{ display }}>
              <img
                style={{
                  width: 300,
                  marginTop: 5,
                  transform: 'scale(1.1)',
                  transformOrigin: 'top',
                }}
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
              />
            </div>
          </>
        }
        interactive={true}
        flipOnUpdate={true}
        arrow={false}
        animation="fade"
        trigger="click"
      >
        <Button>Image transition (click)</Button>
      </Tippy>
    </TippyTransition>
  )
}

export default DimensionsTransition
