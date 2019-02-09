import React from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'

function Ajax({ children }) {
  const initialContent = 'Loading...'

  return (
    <Tippy
      content={initialContent}
      animation="fade"
      animateFill={false}
      flipOnUpdate
      updateDuration={350}
      onShow={async tip => {
        if (!tip.state.ajax) {
          tip.state.ajax = {
            isFetching: false,
            canFetch: true,
          }
        }

        if (tip.state.ajax.isFetching || !tip.state.ajax.canFetch) {
          return
        }

        tip.state.ajax.isFetching = true
        tip.state.ajax.canFetch = false

        try {
          const response = await fetch('https://unsplash.it/200/?random')
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          if (tip.state.isVisible) {
            const img = new Image()
            img.width = 200
            img.height = 200
            img.src = url
            img.style.display = 'block'
            tip.popper.style.transitionDuration = '0ms'
            tip.setContent(img)
          }
        } catch (e) {
          tip.setContent(`Fetch failed. ${e}`)
        } finally {
          tip.state.ajax.isFetching = false
        }
      }}
      onHidden={tip => {
        tip.state.ajax.canFetch = true
        tip.setContent(initialContent)
      }}
    >
      <Button>{children}</Button>
    </Tippy>
  )
}

Ajax.defaultProps = {
  withoutState: false,
}

export default Ajax
