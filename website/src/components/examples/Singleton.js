import React from 'react'
import Tippy, { TippySingleton } from '../Tippy'
import { Button } from '../Framework'

const array = Array(20).fill()

function Singleton() {
  return (
    <TippySingleton delay={[400, 800]}>
      {array.map((_, i) => (
        <Tippy
          key={i}
          updateDuration={400}
          arrow={true}
          animation="fade"
          flipOnUpdate={true}
        >
          <Button>Text</Button>
        </Tippy>
      ))}
    </TippySingleton>
  )
}

export default Singleton
