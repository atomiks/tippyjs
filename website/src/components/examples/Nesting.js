import React from 'react';
import styled from 'styled-components';
import Tippy from '../Tippy';
import {Button} from '../Framework';

const Wrapper = styled.div`
  margin-top: 8px;
  margin-left: 8px;
`;

function Nesting() {
  return (
    <Tippy
      theme="light-border"
      interactive={true}
      content={
        <Wrapper>
          <Tippy
            theme="light-border"
            interactive={true}
            onCreate={({popper}) => {
              popper.style.width = 'max-content';
            }}
            content={
              <Wrapper>
                <Tippy
                  placement="right"
                  theme="light-border"
                  interactive={true}
                  onCreate={({popper}) => {
                    popper.style.width = 'max-content';
                  }}
                  content={
                    <Wrapper>
                      <Tippy
                        placement="bottom"
                        theme="light-border"
                        interactive={true}
                        onCreate={({popper}) => {
                          popper.style.width = 'max-content';
                        }}
                        content="Level 4 (final)"
                      >
                        <Button>Level 3</Button>
                      </Tippy>
                    </Wrapper>
                  }
                >
                  <Button>Level 2</Button>
                </Tippy>
              </Wrapper>
            }
          >
            <Button>Level 1</Button>
          </Tippy>
        </Wrapper>
      }
    >
      <Button>Level 0</Button>
    </Tippy>
  );
}

export default Nesting;
