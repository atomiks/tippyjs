import React, { useEffect, useRef } from 'react'
import { tippy } from '../Tippy'
import { Button } from '../Framework'

const array = Array(16).fill()

function Singleton() {
  const instanceRef = useRef()
  const showTimeoutRef = useRef()
  const hideTimeoutRef = useRef()

  useEffect(() => {
    instanceRef.current = tippy(
      {},
      {
        arrow: true,
        animation: 'fade',
        updateDuration: 500,
        onMount(instance) {
          instance.popper.style.transitionTimingFunction =
            'cubic-bezier(.23,1.42,.16,.96)'
          requestAnimationFrame(() => {
            instance.popperChildren.arrow.style.transitionDuration = '250ms'
          })
        },
        onHide(instance) {
          instance.popperChildren.arrow.style.transitionDuration = ''
        },
      },
    )
  }, [])

  function clearTimeouts() {
    clearTimeout(showTimeoutRef.current)
    clearTimeout(hideTimeoutRef.current)
  }

  function show(event) {
    const instance = instanceRef.current
    const { currentTarget } = event

    instance.reference.getBoundingClientRect = () => {
      return currentTarget.getBoundingClientRect()
    }

    instance.setContent(currentTarget.getAttribute('data-tippy-content'))

    clearTimeouts()

    if (!instance.state.isVisible) {
      showTimeoutRef.current = setTimeout(() => {
        instance.show()
      }, 200)
    }
  }

  function hide() {
    const instance = instanceRef.current

    clearTimeouts()

    if (instance.state.isVisible) {
      hideTimeoutRef.current = setTimeout(() => {
        instance.hide()
      }, 500)
    }
  }

  return array.map((_, i) => (
    <Button
      key={i}
      data-tippy-content={`Tooltip #${i + 1}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      Text
    </Button>
  ))
}

export default Singleton
