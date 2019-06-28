import React, { useState, useEffect } from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'
import TippyTransition from '../TippyTransition'
import { useThis } from '../../hooks'

const contents = [
  'Hello there!',
  'This is an example of a simple text transition.',
  'We are using a FLIP library called `react-flip-toolkit`, which allows 60 FPS transitions of element dimensions.',
  "The text itself does not transition, just the tippy element's dimensions.",
  'You might want to use an opacity transition for the text itself.',
  'Thanks for reading! (restarting...)',
]

function DimensionsTransition() {
  const [content, setContent] = useState(contents[0])
  const $this = useThis({ currentIndex: 0 })

  function scheduleNextContent() {
    const currentIndex = contents.findIndex(c => c === content)
    const nextIndex =
      currentIndex === contents.length - 1 ? 0 : currentIndex + 1
    const nextContent = contents[nextIndex]

    clearTimeout($this.timeout)
    $this.timeout = setTimeout(() => {
      setContent(nextContent)
      scheduleNextContent()
    }, 1000 + contents[currentIndex].length * 50)
  }

  useEffect(() => {
    if ($this.instance.state.isVisible) {
      scheduleNextContent()
    }
  })

  function onCreate(instance) {
    $this.instance = instance
  }

  function onMount() {
    scheduleNextContent()
  }

  function onHidden() {
    clearTimeout($this.timeout)
  }

  return (
    <TippyTransition>
      <Tippy
        content={content}
        onCreate={onCreate}
        onHidden={onHidden}
        onMount={onMount}
        arrow={false}
        animation="fade"
        trigger="click"
      >
        <Button>Text transition (click)</Button>
      </Tippy>
    </TippyTransition>
  )
}

export default DimensionsTransition
