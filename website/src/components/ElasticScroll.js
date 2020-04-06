import React, {useEffect, useRef, cloneElement} from 'react';
import elasticScroll from 'elastic-scroll-polyfill';

function ElasticScroll({children, ...props}) {
  const targetRef = useRef();

  useEffect(() => {
    const instance = elasticScroll({
      targets: targetRef.current,
      ...props,
    });

    return () => {
      instance.disable();
    };
  });

  return cloneElement(children, {
    children: (
      <div
        style={{display: 'inline-block', minWidth: '100%'}}
        data-elastic-wrapper
      >
        {children.props.children}
      </div>
    ),
    ref: (node) => {
      targetRef.current = node;
      const {ref} = children;
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref.hasOwnProperty('current')) {
          ref.current = node;
        }
      }
    },
  });
}

export default ElasticScroll;
