import React from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'

function Ajax() {
  const initialContent = 'Loading...'

  return (
    <Tippy
      content={initialContent}
      animation="fade"
      animateFill={false}
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
      <Button>Hover for a new image</Button>
    </Tippy>
  )
}

export default Ajax
