import React from 'react'
import Tippy, { TippySingleton } from '../Tippy'
import { Button } from '../Framework'

const array = Array(4).fill()

function Singleton({ group, transition }) {
  const updateDuration = transition ? 300 : 0
  const delay = 500

  const children = array.map((_, i) => (
    <Tippy
      key={i}
      content={`Tooltip ${i + 1}`}
      animation="fade"
      arrow={true}
      flipOnUpdate={true}
      updateDuration={updateDuration}
      delay={delay}
    >
      <Button>Text</Button>
    </Tippy>
  ))

  return !group ? (
    children
  ) : (
    <TippySingleton delay={delay}>{children}</TippySingleton>
  )
}

export default Singleton
