import React from 'react'
import Tippy from './Tippy'

function PropSymbol({ method }) {
  const label = method
    ? `This prop can be updated via a method.`
    : 'This prop can be updated by setting a new value on instance.props.'

  return (
    <Tippy content={label}>
      <span tabIndex="0">{method ? 'ℹ️' : '✅'}</span>
    </Tippy>
  )
}

export default PropSymbol
