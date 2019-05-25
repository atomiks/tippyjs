import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import TippyBase, { tippy } from '../Tippy'
import { MEDIA } from '../Framework'

const Wrapper = styled.div`
  max-width: 275px;
  line-height: 24px;

  ${MEDIA.md} {
    max-width: 400px;
  }
`

const Tippy = styled(TippyBase)`
  .tippy-arrow {
    margin: 0;
  }
`

function AnchorLink({ smart }) {
  const ref = useRef()

  const sharedOptions = {
    content: "I'm a Tippy tooltip!",
    animation: 'fade',
    arrow: true,
  }

  useEffect(() => {
    const instance = tippy(document.createElement('div'), {
      ...sharedOptions,
      triggerTarget: ref.current,
      onTrigger(instance, { type, clientX, clientY }) {
        instance._lastTriggerEventType = type

        if (type === 'mouseenter') {
          const LINE_HEIGHT = 24
          const rect = ref.current.getBoundingClientRect()
          const cursorPoint = Math.round(clientY - rect.top)
          const lineIndex = Math.floor(cursorPoint / LINE_HEIGHT)
          const top = rect.top + lineIndex * LINE_HEIGHT
          const bottom = top + LINE_HEIGHT

          instance.reference.getBoundingClientRect = () => ({
            width: 0,
            height: bottom - top,
            top,
            bottom,
            left: clientX,
            right: clientX,
          })
        } else {
          instance.reference.getBoundingClientRect = () => {
            return ref.current.getBoundingClientRect()
          }
        }
      },
      onMount(instance) {
        if (instance._lastTriggerEventType === 'mouseenter') {
          instance.popperInstance.disableEventListeners()
        }
      },
    })
    return () => {
      instance.destroy()
    }
  }, [])

  return (
    <Wrapper>
      Here is some text and then an{' '}
      {!smart ? (
        <Tippy {...sharedOptions}>
          <a id="AnchorLink1" href="#AnchorLink1">
            anchor link that spans over two lines.
          </a>
        </Tippy>
      ) : (
        <a id="AnchorLink2" ref={ref} href="#AnchorLink2">
          anchor link that spans over two lines.
        </a>
      )}
    </Wrapper>
  )
}

export default AnchorLink
