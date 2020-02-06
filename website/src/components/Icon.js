import React from 'react';

function Icon({src, alt}) {
  return (
    <img
      src={src}
      alt={alt}
      draggable="false"
      style={{
        position: 'relative',
        width: 32,
        top: 9,
        left: -2,
        userSelect: 'none',
      }}
    />
  );
}

export default Icon;
