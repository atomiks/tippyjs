import React, {forwardRef} from 'react';
import {css} from '@emotion/core';

const Icon = forwardRef(({src, alt, float, size = 32}, ref) => {
  return (
    <img
      src={src}
      alt={alt}
      ref={ref}
      draggable="false"
      css={css`
        position: relative;
        width: ${size}px;
        vertical-align: middle;
        top: -2px;
        margin-right: 10px;
        user-select: none;
        float: ${float ? 'left' : 'none'};
        overflow: hidden;
      `}
    />
  );
});

export default Icon;
