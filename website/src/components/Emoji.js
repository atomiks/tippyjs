import React from 'react'

function Emoji({ emoji }) {
  return (
    <span
      style={{
        position: 'relative',
        fontSize: '1.5rem',
        top: '0.125rem',
        left: '-0.125rem',
      }}
    >
      {emoji}
    </span>
  )
}

export default Emoji
