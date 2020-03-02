import React, {useState, useEffect, useRef} from 'react';
import Tippy from '../Tippy';
import styled from '@emotion/styled';

const PositioningTarget = styled.span`
  background: tomato;
  color: white;
  padding: 4px 8px;
`;

function TriggerTarget() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{marginBottom: 8}}>
      <span ref={ref}>Trigger target</span> vs{' '}
      {mounted && (
        <Tippy triggerTarget={ref.current}>
          <PositioningTarget>positioning target</PositioningTarget>
        </Tippy>
      )}
    </div>
  );
}

export default TriggerTarget;
