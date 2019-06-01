import React, { useState, useRef, useMemo } from 'react'
import Flipper from 'react-flip-toolkit/es/core'
import Tippy from '../Tippy'
import { Button } from '../Framework'

function parseTranslate3d(string) {
  const match = string.match(/translate3d\((.+?),\s*(.+?),/)
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
}

function DimensionsTransition() {
  const [enabled, setEnabled] = useState(true)
  const [display, setDisplay] = useState('none')
  const [expanded, setExpanded] = useState(false)
  const [originalDimensions, setOriginalDimensions] = useState(null)
  const [instance, setInstance] = useState(null)
  const [flipper, setFlipper] = useState(null)
  const wasInterruptedRef = useRef(false)
  const wasManuallyUpdatedRef = useRef(false)
  const offsetsRef = useRef({
    prev: undefined,
    current: undefined,
    tween: undefined,
  })
  const distanceRef = useRef({
    prev: undefined,
    current: undefined,
    tween: undefined,
  })

  function onCreate(instance) {
    const { popper } = instance
    const { tooltip, content, arrow } = instance.popperChildren

    // Very first transition is jerky otherwise.
    content.style.willChange = 'transform'
    tooltip.style.textAlign = 'left'

    const flipper = new Flipper({ element: popper })

    flipper.addFlipped({
      element: tooltip,
      // TODO: Make this unique if this component is used more than once
      flipId: 'tooltip',
      spring: 'veryGentle',
      onStart() {
        setEnabled(false)
      },
      onComplete() {
        setEnabled(true)
        wasManuallyUpdatedRef.current = false
      },
      // We need to ensure the popper's translation animation is in concert with the
      // dimensions spring animation so it stays perfectly positioned throughout
      onSpringUpdate(springValue) {
        if (wasInterruptedRef.current && offsetsRef.current.tween) {
          offsetsRef.current.prev = offsetsRef.current.tween
          wasInterruptedRef.current = false
        }

        const { x: prevX, y: prevY } = offsetsRef.current.prev
        const { x: currentX, y: currentY } = offsetsRef.current.current
        const {
          property: prevProperty,
          value: prevValue,
        } = distanceRef.current.prev
        const {
          property: currentProperty,
          value: currentValue,
        } = distanceRef.current.current

        const x = prevX - springValue * (prevX - currentX)
        const y = prevY - springValue * (prevY - currentY)
        const distance =
          prevValue -
          Math.max(0, Math.min(springValue, 1)) * (prevValue - currentValue)

        offsetsRef.current.tween = { x, y }
        distanceRef.current.tween = {
          property: currentProperty,
          value: distance,
        }

        instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`

        const { tooltip } = instance.popperChildren

        tooltip.style[prevProperty] = '0'
        tooltip.style[currentProperty] = `${distance}px`
      },
    })

    flipper.addInverted({
      element: content,
      parent: tooltip,
    })

    if (arrow) {
      flipper.addInverted({
        element: arrow,
        parent: tooltip,
      })
    }

    setInstance(instance)
    setFlipper(flipper)
  }

  function onMount() {
    const { tooltip } = instance.popperChildren

    if (!originalDimensions) {
      const originalDimensions = {
        width: tooltip.offsetWidth,
        height: tooltip.offsetHeight,
      }
      tooltip.style.width = `${originalDimensions.width}px`
      tooltip.style.height = `${originalDimensions.height}px`
      setOriginalDimensions(originalDimensions)
      setDisplay('block')
    }
  }

  function onClick() {
    const { width, height } = originalDimensions
    const { tooltip } = instance.popperChildren
    const nextExpanded = !expanded

    Object.values(instance.popperChildren).forEach(element => {
      if (element) {
        element.style.transitionDuration = '0ms'
      }
    })

    wasManuallyUpdatedRef.current = true

    flipper.recordBeforeUpdate()

    tooltip.style.width = nextExpanded ? '' : `${width}px`
    tooltip.style.height = nextExpanded ? '' : `${height}px`

    instance.popperInstance.update()
    flipper.onUpdate()

    setExpanded(nextExpanded)
  }

  function popperOnCreate(data) {
    const offsets = parseTranslate3d(data.styles.transform)
    offsetsRef.current.current = offsets
    offsetsRef.current.prev = offsets

    const { tooltip } = instance.popperChildren
    const property = tooltip.style.top ? 'top' : 'left'
    const value = parseFloat(tooltip.style[property])

    distanceRef.current.prev = { property, value }
    distanceRef.current.current = { property, value }
  }

  function popperOnUpdate(data) {
    wasInterruptedRef.current = true
    offsetsRef.current.prev = offsetsRef.current.current
    distanceRef.current.prev = distanceRef.current.current

    const { tooltip, arrow } = instance.popperChildren

    // `react-flip-toolkit` adds this
    if (arrow) {
      arrow.style.transformOrigin = ''
    }

    // We need to parse it because Popper rounds the values but doesn't
    // expose the rounded values for us...
    const offsets = parseTranslate3d(data.styles.transform)
    const currentProperty = tooltip.style.top ? 'top' : 'left'
    const currentValue = parseFloat(tooltip.style[currentProperty])

    // Runs after `onSpringUpdate` tick
    requestAnimationFrame(() => {
      offsetsRef.current.current = offsets
      distanceRef.current.current = {
        property: currentProperty,
        value: currentValue,
      }

      // ...
      requestAnimationFrame(() => {
        offsetsRef.current.tween = offsets
      })
    })

    const { x, y } = offsetsRef.current.tween || offsetsRef.current.prev
    const { property, value } =
      distanceRef.current.tween || distanceRef.current.prev

    // onSpringUpdate and popper's .update() run in different ticks, leading to
    // 1 frame glitch
    if (wasManuallyUpdatedRef.current) {
      instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`
      tooltip.style[property] = `${value}px`
    }
  }

  const popperOptions = useMemo(
    () => ({
      onCreate: popperOnCreate,
      onUpdate: popperOnUpdate,
    }),
    [instance],
  )

  return (
    <Tippy
      enabled={enabled}
      content={
        <>
          <Button onClick={onClick} style={{ margin: 10, width: 140 }}>
            {expanded ? 'Close' : 'Open'} Image
          </Button>
          <div style={{ display }}>
            <img
              style={{
                width: 300,
                marginTop: 5,
                transform: 'scale(1.1)',
                transformOrigin: 'top',
              }}
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
            />
          </div>
        </>
      }
      interactive={true}
      animateFill={false}
      flipOnUpdate={true}
      animation="fade"
      trigger="click"
      onCreate={onCreate}
      onMount={onMount}
      popperOptions={popperOptions}
    >
      <Button>Click to show</Button>
    </Tippy>
  )
}

export default DimensionsTransition
