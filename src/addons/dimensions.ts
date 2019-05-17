import { Instance } from '../types'

export function recordDimensions(instance: Instance): void {
  const { popper } = instance
  const { tooltip, content } = instance.popperChildren

  popper.style.width = ''
  popper.style.height = ''
  tooltip.style.width = ''
  tooltip.style.height = ''
  content.style.width = ''
  content.style.height = ''

  instance.__dimensions = [tooltip.offsetWidth, tooltip.offsetHeight]
}

export function updateDimensions(instance: Instance): void {
  const { popper } = instance
  const { tooltip, content } = instance.popperChildren
  const { updateDuration, updateTimingFunction } = instance.props

  if (process.env.NODE_ENV !== 'production') {
    if (!instance.__dimensions) {
      console.error(
        '[tippy.js ERROR] `dimensions.record()` must be called before ' +
          '`dimensions.update()`.',
      )
    }
  }

  let currentTooltipWidth, currentTooltipHeight

  if (instance.__dimensions) {
    ;[currentTooltipWidth, currentTooltipHeight] = instance.__dimensions
  }

  const nextTooltipWidth = tooltip.offsetWidth
  const nextTooltipHeight = tooltip.offsetHeight
  const nextContentWidth = content.offsetWidth
  const nextContentHeight = content.offsetHeight

  popper.style.width = `${nextTooltipWidth}px`
  popper.style.height = `${nextTooltipHeight}px`
  tooltip.style.width = `${currentTooltipWidth}px`
  tooltip.style.height = `${currentTooltipHeight}px`
  // TODO: figure out why this needs 1 extra pixel? Otherwise the content can
  // reflow in height and be cut off.
  content.style.width = `${nextContentWidth + 1}px`
  content.style.height = `${nextContentHeight}px`

  tooltip.style.transitionDuration = `${updateDuration}ms`
  tooltip.style.transitionTimingFunction = updateTimingFunction

  void tooltip.offsetHeight

  tooltip.style.width = `${nextTooltipWidth}px`
  tooltip.style.height = `${nextTooltipHeight}px`

  delete instance.__dimensions
}
