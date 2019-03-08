import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import tippy from 'tippy.js'
import Tippy from '../Tippy'
import { MEDIA } from '../Framework'

const Wrapper = styled.div`
  max-width: 275px;
  line-height: 22px;

  ${MEDIA.md} {
    max-width: 400px;
  }
`

function AnchorLink({ smart }) {
  const ref = useRef()
  const instanceRef = useRef()

  const options = {
    content: "I'm a Tippy tooltip!",
    animation: 'fade',
    arrow: true,
    onMount(instance) {
      instance.popperInstance.disableEventListeners()
    },
  }

  useEffect(() => {
    instanceRef.current = tippy(
      {
        clientWidth: 0,
        clientHeight: 0,
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }
        },
      },
      options,
    )
  }, [])

  function onMouseEnter({ clientX, clientY }) {
    const LINE_HEIGHT = 22
    const rect = ref.current.getBoundingClientRect()
    const cursorPoint = Math.round(clientY - rect.top)
    const lineIndex = Math.floor(cursorPoint / LINE_HEIGHT)
    const top = rect.top + lineIndex * LINE_HEIGHT
    const bottom = top + LINE_HEIGHT
    instanceRef.current.reference.getBoundingClientRect = () => ({
      width: 0,
      height: bottom - top,
      top,
      bottom,
      left: clientX,
      right: clientX,
    })
    instanceRef.current.reference.clientHeight = bottom - top
    instanceRef.current.show()
  }

  function onMouseLeave() {
    instanceRef.current.hide()
  }

  return (
    <Wrapper>
      Here is some text and then an{' '}
      {!smart ? (
        <Tippy {...options}>
          <a id="AnchorLink1" href="#AnchorLink1">
            anchor link that spans over two lines.
          </a>
        </Tippy>
      ) : (
        <a
          id="AnchorLink2"
          ref={ref}
          href="#AnchorLink2"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          anchor link that spans over two lines.
        </a>
      )}
    </Wrapper>
  )
}

export default AnchorLink
