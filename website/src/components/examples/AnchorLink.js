import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import Tippy, { tippy } from '../Tippy'
import { MEDIA } from '../Framework'

const Wrapper = styled.div`
  max-width: 275px;
  line-height: 24px;

  ${MEDIA.md} {
    max-width: 400px;
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
    const anchor = ref.current
    const virtualReference = {}

    const instance = tippy(virtualReference, {
      ...sharedOptions,
      triggerTarget: anchor,
      onTrigger(instance, { type, clientY }) {
        instance._lastTriggerEventType = type

        const rects = Array.from(anchor.getClientRects())
        const rect = rects.filter(
          rect =>
            clientY >= Math.floor(rect.top) &&
            clientY <= Math.ceil(rect.bottom),
        )[0]

        virtualReference.getBoundingClientRect = () => {
          return type === 'mouseenter' ? rect : anchor.getBoundingClientRect()
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
