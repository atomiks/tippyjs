import React, { Component } from 'react'
import styled from 'styled-components'
import Tippy from '../Tippy'
import { Button, MEDIA } from '../Framework'
import ElasticScroll from '../ElasticScroll'

const ScrollingContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  overflow: auto;
  color: #787eae;

  ${MEDIA.sm} {
    min-width: 300px;
    flex: 1;
  }

  &::-webkit-scrollbar {
    -webkit-appearance: none;
  }

  &::-webkit-scrollbar:vertical {
    width: 10px;
  }

  &::-webkit-scrollbar:horizontal {
    height: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    border: 1px solid white;
    background-color: rgba(0, 16, 40, 0.4);
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 8px;
  }
`

const Type = styled.div`
  position: absolute;
  top: 12px;
  left: 16px;
  font-weight: bold;
`

const ScrollingBackground = styled.div`
  width: 600px;
  height: 600px;
  background: white;
`

class Scroller extends Component {
  handleScroll = () => {
    if (this.props.hideOnScroll) {
      this.instance.hide(0)
    }
  }

  storeTippyInstance = instance => {
    this.instance = instance
  }

  render() {
    const props = {}

    if (this.props.flipOnUpdate) {
      props.flipOnUpdate = true
      props.appendTo = 'parent'
    }

    if (this.props.boundary) {
      props.boundary = 'window'
      props.appendTo = ref => ref.parentNode
    }

    if (this.props.flipOnUpdate || this.props.boundary) {
      props.popperOptions = {
        modifiers: {
          flip: {
            boundariesElement: 'scrollParent',
          },
        },
      }
    }

    return (
      <ElasticScroll>
        <ScrollingContainer onScroll={this.handleScroll}>
          <ScrollingBackground>
            <Type>{this.props.type}</Type>
            <Tippy
              trigger="click"
              onCreate={this.storeTippyInstance}
              {...props}
            >
              <Button style={{ transform: 'translate(85px, 125px)' }}>
                Click to open
              </Button>
            </Tippy>
          </ScrollingBackground>
        </ScrollingContainer>
      </ElasticScroll>
    )
  }
}

export default Scroller
