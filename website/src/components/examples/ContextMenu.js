import React, {useEffect, useRef} from 'react';
import {tippy} from '../Tippy';
import {css} from '@emotion/core';

function ContextMenu() {
  const containerRef = useRef();

  useEffect(() => {
    function handleContextMenu(event) {
      event.preventDefault();

      instance.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: event.clientY,
          bottom: event.clientY,
          left: event.clientX,
          right: event.clientX,
        }),
      });

      instance.show();
    }

    function handleScroll() {
      instance.hide();
      instance.unmount();
    }

    const container = containerRef.current;

    const instance = tippy(container, {
      content: 'Context menu',
      offset: [0, 0],
      arrow: false,
      placement: 'right-start',
      interactive: true,
      theme: 'light',
      trigger: 'manual',
    });

    container.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('scroll', handleScroll);
      instance.destroy();
    };
  });

  return (
    <div
      ref={containerRef}
      css={css`
        position: relative;
        overflow: hidden;
        margin-bottom: 8px;
        border: 2px dashed red;
        position: relative;
        height: 250px;
        display: grid;
        place-items: center;
      `}
    >
      Right click inside
    </div>
  );
}

export default ContextMenu;
