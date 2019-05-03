import React, { useState, useEffect, useRef } from 'react'
import Tippy from '../Tippy'
import styled from 'styled-components'

const PositioningTarget = styled.span`
  background: tomato;
  color: white;
  padding: 4px 8px;
`

function TriggerTarget() {
  const [mounted, setMounted] = useState(false)
  const ref = useRef()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div ref={ref} style={{ marginBottom: 8 }}>
      Trigger target vs{' '}
      {mounted && (
        <Tippy triggerTarget={ref.current}>
          <PositioningTarget>positioning target</PositioningTarget>
        </Tippy>
      )}
    </div>
  )
}

export default TriggerTarget
