/**
 * CSS transitions to change width/height layout of a tippy element.
 *
 * This file isn't being used yet. But maybe it'll serve a purpose in the
 * future?
 *
 * It's recommended instead to use:
 * - A FLIP library like `react-flip-toolkit`
 * - A spring animation library like `animejs`
 * to transition a tippy element's dimensions and position on the page.
 */

import { Instance, Options } from '../types'

interface DimensionsInstance extends Instance {
  __dimensions?: {
    tooltipWidth: number
    tooltipHeight: number
    contentWidth: number
    contentHeight: number
  }
  __dimensionsTimeout?: any
  __fadeTimeout?: any
  transitionDimensions?: boolean
}

function recordDimensions(instance: DimensionsInstance): void {
  const { tooltip, content } = instance.popperChildren
  instance.__dimensions = {
    tooltipWidth: tooltip.offsetWidth,
    tooltipHeight: tooltip.offsetHeight,
    contentWidth: content.offsetWidth,
    contentHeight: content.offsetHeight,
  }
}

function updateDimensions(
  instance: DimensionsInstance,
  useFade = false,
  onComplete?: () => void,
): void {
  const { popper } = instance
  const { tooltip, content, arrow } = instance.popperChildren
  const { updateDuration } = instance.props

  if (!instance.state.isMounted || !instance.__dimensions) {
    return
  }

  popper.style.width = ''
  popper.style.height = ''
  tooltip.style.width = ''
  tooltip.style.height = ''
  content.style.width = ''
  content.style.height = ''
  content.style.overflow = useFade || !instance.props.arrow ? '' : 'hidden'

  clearTimeout(instance.__dimensionsTimeout)
  if (onComplete) {
    instance.__dimensionsTimeout = setTimeout(() => {
      onComplete()
    }, updateDuration)
  }

  const {
    tooltipWidth,
    tooltipHeight,
    contentWidth,
    contentHeight,
  } = instance.__dimensions

  const nextTooltipWidth = tooltip.offsetWidth
  const nextTooltipHeight = tooltip.offsetHeight
  const nextContentWidth = content.offsetWidth
  const nextContentHeight = content.offsetHeight

  popper.style.width = `${nextTooltipWidth}px`
  popper.style.height = `${nextTooltipHeight}px`
  tooltip.style.width = `${tooltipWidth}px`
  tooltip.style.height = `${tooltipHeight}px`

  if (instance.props.arrow) {
    content.style.width = `${contentWidth}px`
    content.style.height = `${contentHeight}px`
  }

  const elementsToTransition = [tooltip, content, arrow]
  elementsToTransition.forEach(element => {
    if (element) {
      element.style.transitionDuration = `${updateDuration}ms`
      // easeOutQuart (same as index.css .tippy-popper)
      element.style.transitionTimingFunction = 'cubic-bezier(.165,.84,.44,1)'
    }
  })

  // Reflow to begin transition
  void tooltip.offsetHeight

  tooltip.style.width = `${nextTooltipWidth}px`
  tooltip.style.height = `${nextTooltipHeight}px`
  // TODO: figure out why this needs 1 extra pixel? Otherwise the content can
  // reflow in height and be cut off.
  content.style.width = `${nextContentWidth + 1}px`
  content.style.height = `${nextContentHeight}px`
}

/**
 * If the tippy has an arrow, we can't rely on the `overflow: hidden ` behavior
 * because the arrow element is a child of `.tippy-tooltip`. This means it will
 * get cut off. In this case, we need to fade the content out first before
 * transitioning its dimensions, then fade the content back in.
 */
function fade(
  opacity: '0' | '1',
  instance: DimensionsInstance,
  duration: number,
  onComplete?: () => void,
): void {
  const { content } = instance.popperChildren

  clearTimeout(instance.__fadeTimeout)

  if (onComplete) {
    instance.__fadeTimeout = setTimeout(() => {
      onComplete()
    }, duration)
  }

  content.style.transitionDuration = `${duration}ms`
  content.style.opacity = opacity
}

export default function transitionDimensions(
  instance: DimensionsInstance,
  useFade = false,
  fadeDuration = 200,
): (effectCallback: () => void) => void {
  if (process.env.NODE_ENV !== 'production') {
    if (instance.transitionDimensions) {
      throw new Error(
        '[tippy.js ERROR] Cannot call `transitionDimensions()` more than once',
      )
    }
  }

  const originalSet = instance.set

  instance.transitionDimensions = true
  instance.set = set

  const opacity = useFade ? '0' : '1'
  const duration = useFade ? fadeDuration : 0

  function set(options: Options, effectCallback?: () => void) {
    if (instance.state.isMounted) {
      recordDimensions(instance)

      fade(opacity, instance, duration, () => {
        originalSet(options)

        if (effectCallback) {
          effectCallback()
        }

        updateDimensions(instance, useFade, () => {
          fade('1', instance, duration)
        })
      })
    } else {
      originalSet(options)
    }
  }

  return (effectCallback: () => void) => {
    set({}, effectCallback)
  }
}
