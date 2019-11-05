import React from 'react';

function Emoji({emoji}) {
  return (
    <span
      style={{
        position: 'relative',
        fontSize: '24px',
        top: '2px',
        left: '-2px',
      }}
    >
      {emoji}
    </span>
  );
}

export default Emoji;
