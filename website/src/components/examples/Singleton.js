import React, { useEffect, useRef } from 'react'
import { tippy } from '../Tippy'
import { Button } from '../Framework'

const array = Array(16).fill()

function Singleton() {
  const instanceRef = useRef()
  const showTimeoutRef = useRef()
  const hideTimeoutRef = useRef()

  useEffect(() => {
    const instance = tippy(
      {},
      {
        arrow: true,
        animation: 'fade',
        duration: [300, 100],
        updateDuration: 600,
        onMount(instance) {
          requestAnimationFrame(() => {
            instance.popperChildren.arrow.style.transitionDuration = '250ms'
          })
        },
        onHide(instance) {
          instance.popperChildren.arrow.style.transitionDuration = ''
        },
      },
    )

    instance.popper.style.transitionTimingFunction =
      'cubic-bezier(.23,1.42,.16,.96)'

    instanceRef.current = instance

    return () => {
      instance.destroy()
    }
  }, [])

  function clearTimeouts() {
    clearTimeout(showTimeoutRef.current)
    clearTimeout(hideTimeoutRef.current)
  }

  function show(event) {
    const instance = instanceRef.current
    const { currentTarget } = event
    let deferred

    function setContent() {
      instance.setContent(currentTarget.getAttribute('data-tippy-content'))
    }

    instance.reference.getBoundingClientRect = () => {
      return currentTarget.getBoundingClientRect()
    }

    // Hiding, but not unmounted yet
    deferred = instance.state.isMounted && !instance.state.isVisible

    if (!deferred) {
      setContent()
    }

    clearTimeouts()

    if (!instance.state.isVisible) {
      showTimeoutRef.current = setTimeout(() => {
        if (deferred) {
          setContent()
        }

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
      }, 800)
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
