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
    popperOptions: {
      onUpdate() {
        instanceRef.current.popperChildren.arrow.style.margin = '0'
      },
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

  function createVirtualReference() {
    const anchor = ref.current
    return {
      getBoundingClientRect: () => anchor.getBoundingClientRect(),
      clientWidth: anchor.clientWidth,
      clientHeight: anchor.clientHeight,
    }
  }

  function show({ type, clientX, clientY }) {
    const instance = instanceRef.current

    if (type === 'mouseenter') {
      const LINE_HEIGHT = 22
      const rect = ref.current.getBoundingClientRect()
      const cursorPoint = Math.round(clientY - rect.top)
      const lineIndex = Math.floor(cursorPoint / LINE_HEIGHT)
      const top = rect.top + lineIndex * LINE_HEIGHT
      const bottom = top + LINE_HEIGHT

      Object.assign(instance.reference, {
        clientHeight: bottom - top,
        getBoundingClientRect() {
          return {
            width: 0,
            height: bottom - top,
            top,
            bottom,
            left: clientX,
            right: clientX,
          }
        },
      })

      // Prevent the tooltip from following scroll
      setTimeout(() => {
        instance.popperInstance.disableEventListeners()
      })
    } else {
      Object.assign(instance.reference, createVirtualReference())
    }

    instance.show()
  }

  function hide() {
    const instance = instanceRef.current
    requestAnimationFrame(() => {
      instance.hide()
    })
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
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          anchor link that spans over two lines.
        </a>
      )}
    </Wrapper>
  )
}

export default AnchorLink
