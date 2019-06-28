import { cloneElement, Children } from 'react'
import Flipper from 'react-flip-toolkit/es/core'
import { useThis } from '../hooks'

function parseTranslate3d(string) {
  const match = string.match(/translate3d\((.+?),\s*(.+?),/)
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
}

function preserveInvocation(fn, args) {
  if (fn) {
    fn.apply(null, args)
  }
}

function useStableMemo(fn, deps) {
  const $this = useThis()
  let areDepsEqual = $this.prevDeps ? true : false

  if (Array.isArray(deps) && areDepsEqual) {
    for (let i = 0; i < deps.length; i++) {
      if (deps[i] !== $this.prevDeps[i]) {
        areDepsEqual = false
        break
      }
    }
  }

  $this.prevDeps = deps

  if (!areDepsEqual) {
    $this.result = fn()
  }

  return $this.result
}

function TippyTransition({ children, onChange }) {
  const $this = useThis({
    areDimensionsTransitioning: false,
    offsets: {},
    distance: {},
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
        $this.instance.popperInstance.disableEventListeners()
        $this.areDimensionsTransitioning = true
      },
      onComplete() {
        $this.instance.popperInstance.enableEventListeners()
        $this.wasManuallyUpdated = false
        $this.areDimensionsTransitioning = false
      },
      onSpringUpdate(springValue) {
        if ($this.wasInterrupted) {
          // Since the FLIP animation was interrupted, the popper's translation
          // begins at the tweened offset
          $this.offsets.prev = $this.offsets.tween
          $this.wasInterrupted = false
        }

        const { x: prevX, y: prevY } = $this.offsets.prev
        const { x: currentX, y: currentY } = $this.offsets.current
        const {
          property: prevProperty,
          value: prevDistance,
        } = $this.distance.prev
        const {
          property: currentProperty,
          value: currentDistance,
        } = $this.distance.current

        // Calculate tweened offset and distance
        const tweenedX = prevX - springValue * (prevX - currentX)
        const tweenedY = prevY - springValue * (prevY - currentY)
        const tweenedDistance =
          prevDistance -
          Math.max(0, Math.min(springValue, 1)) *
            (prevDistance - currentDistance)

        // Write the current tweened offsets due to the FLIP animation
        $this.offsets.tween = { x: tweenedX, y: tweenedY }
        $this.distance.tween = {
          property: currentProperty,
          value: tweenedDistance,
        }

        // Set tweened transform
        const tweenedTransform = `translate3d(${tweenedX}px, ${tweenedY}px, 0)`
        $this.instance.popper.style.transform = tweenedTransform

        // Set tweened distance
        const { tooltip } = $this.instance.popperChildren
        tooltip.style[prevProperty] = '0'
        tooltip.style[currentProperty] = `${tweenedDistance}px`
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

    $this.instance = instance
    $this.flipper = flipper
  }

  function onBeforeUpdate() {
    if (!$this.instance.state.isVisible) {
      return
    }

    $this.wasManuallyUpdated = true
    $this.flipper.recordBeforeUpdate()

    const { tooltip } = $this.instance.popperChildren
    const prevDimensions = $this.dimensions

    tooltip.style.width = ''
    tooltip.style.height = ''

    $this.dimensions = {
      width: tooltip.offsetWidth,
      height: tooltip.offsetHeight,
    }

    if (prevDimensions) {
      tooltip.style.width = `${prevDimensions.width}px`
      tooltip.style.height = `${prevDimensions.height}px`
    }

    Object.keys($this.instance.popperChildren).forEach(key => {
      if ($this.instance.popperChildren[key]) {
        $this.instance.popperChildren[key].style.transitionDuration = '0ms'
      }
    })

    if ($this.dimensions.width) {
      tooltip.style.width = `${$this.dimensions.width + 1}px`
      tooltip.style.height = `${$this.dimensions.height}px`
    }
  }

  function onAfterUpdate(instance) {
    $this.flipper.onUpdate()

    if (onChange) {
      onChange(instance)
    }
  }

  function onMount() {
    if (!$this.dimensions) {
      onBeforeUpdate()
    }
  }

  function onHide() {
    if ($this.areDimensionsTransitioning) {
      return false
    }
  }

  function popperOnCreate(data) {
    const currentOffsets = parseTranslate3d(data.styles.transform)
    $this.offsets.prev = currentOffsets
    $this.offsets.current = currentOffsets
    $this.offsets.tween = currentOffsets

    const { tooltip } = $this.instance.popperChildren
    const property = tooltip.style.top ? 'top' : 'left'
    const value = parseFloat(tooltip.style[property])

    $this.distance.prev = { property, value }
    $this.distance.current = { property, value }
    $this.distance.tween = { property, value }
  }

  function popperOnUpdate(data) {
    const { tooltip, arrow } = $this.instance.popperChildren

    // `react-flip-toolkit` adds this
    if (arrow) {
      arrow.style.transformOrigin = ''
    }

    $this.wasInterrupted = true
    $this.offsets.prev = $this.offsets.current
    $this.distance.prev = $this.distance.current

    // We need to parse it because Popper rounds the values but doesn't expose
    // the rounded values for us...
    const currentOffsets = parseTranslate3d(data.styles.transform)
    const currentProperty = tooltip.style.top ? 'top' : 'left'
    const currentValue = parseFloat(tooltip.style[currentProperty])

    $this.offsets.current = currentOffsets
    $this.distance.current = {
      property: currentProperty,
      value: currentValue,
    }

    // Runs AFTER first `onSpringUpdate` frame
    requestAnimationFrame(() => {
      $this.offsets.tween = currentOffsets
    })

    // onSpringUpdate and popper's .update() run in different frames, leading to
    // 1 frame glitch
    if ($this.wasManuallyUpdated) {
      const { x, y } = $this.offsets.tween || $this.offsets.prev
      const { property, value } = $this.distance.tween || $this.distance.prev
      $this.instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`
      tooltip.style[property] = `${value}px`
    }
  }

  const child = Children.only(children)

  const popperOptions = useStableMemo(
    () => ({
      ...child.props.popperOptions,
      onCreate(data) {
        preserveInvocation(
          child.props.popperOptions && child.props.popperOptions.onCreate,
          [data],
        )
        popperOnCreate(data)
      },
      onUpdate(data) {
        preserveInvocation(
          child.props.popperOptions && child.props.popperOptions.onUpdate,
          [data],
        )
        popperOnUpdate(data)
      },
    }),
    [child.props.popperOptions],
  )

  return cloneElement(child, {
    popperOptions,
    onBeforeUpdate(instance) {
      preserveInvocation(child.props.onBeforeUpdate, [instance])
      onBeforeUpdate(instance)
    },
    onAfterUpdate(instance) {
      preserveInvocation(child.props.onAfterUpdate, [instance])
      onAfterUpdate(instance)
    },
    onCreate(instance) {
      preserveInvocation(child.props.onCreate, [instance])
      onCreate(instance)
    },
    onMount(instance) {
      preserveInvocation(child.props.onMount, [instance])
      onMount(instance)
    },
    onHide(instance) {
      const consumerResult = preserveInvocation(child.props.onHide, [instance])
      const ourResult = onHide(instance)
      return consumerResult === false || ourResult === false ? false : undefined
    },
  })
}

export default TippyTransition
