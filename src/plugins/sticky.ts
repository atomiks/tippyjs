import { Instance, Props, StickyProps } from '../types'

interface ExtendedInstance extends Instance {
  props: Props & StickyProps
}

export default function sticky(instance: ExtendedInstance): Partial<Props> {
  const { reference, popper } = instance

  function shouldCheck(value: 'reference' | 'popper'): boolean {
    return instance.props.sticky === true || instance.props.sticky === value
  }

  let prevRefRect = shouldCheck('reference')
    ? reference.getBoundingClientRect()
    : null
  let prevPopRect = shouldCheck('popper')
    ? popper.getBoundingClientRect()
    : null

  function updatePosition(): void {
    const currentRefRect = shouldCheck('reference')
      ? reference.getBoundingClientRect()
      : null
    const currentPopRect = shouldCheck('popper')
      ? popper.getBoundingClientRect()
      : null

    // Schedule an update if the reference rect has changed
    if (
      (shouldCheck('reference') &&
        areRectsDifferent(prevRefRect, currentRefRect)) ||
      (shouldCheck('popper') && areRectsDifferent(prevPopRect, currentPopRect))
    ) {
      instance.popperInstance!.update()
    }

    prevRefRect = currentRefRect
    prevPopRect = currentPopRect

    if (instance.state.isMounted) {
      requestAnimationFrame(updatePosition)
    }
  }

  return {
    onMount(): void {
      if (instance.props.sticky) {
        updatePosition()
      }
    },
  }
}

function areRectsDifferent(
  rectA: ClientRect | null,
  rectB: ClientRect | null,
): boolean {
  if (rectA && rectB) {
    return (
      rectA.top !== rectB.top ||
      rectA.right !== rectB.right ||
      rectA.bottom !== rectB.bottom ||
      rectA.left !== rectB.left
    )
  }

  return true
}
