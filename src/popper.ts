import Popper from 'popper.js'
import Selectors from './selectors'
import { arrayFrom } from './ponyfills'
import { innerHTML, div } from './utils'
import { isUCBrowser } from './browser'
import {
  PopperElement,
  Props,
  PopperChildren,
  HideAllOptions,
  BasicPlacement,
  PopperInstance,
} from './types'

/**
 * Sets the innerHTML of an element
 */
export function setInnerHTML(element: Element, html: string | Element) {
  element[innerHTML()] = html instanceof Element ? html[innerHTML()] : html
}

/**
 * Sets the content of a tooltip
 */
export function setContent(contentEl: PopperChildren['content'], props: Props) {
  if (props.content instanceof Element) {
    setInnerHTML(contentEl, '')
    contentEl.appendChild(props.content)
  } else if (typeof props.content !== 'function') {
    const key: 'innerHTML' | 'textContent' = props.allowHTML
      ? 'innerHTML'
      : 'textContent'
    contentEl[key] = props.content
  }
}

/**
 * Returns the child elements of a popper element
 */
export function getChildren(popper: PopperElement): PopperChildren {
  return {
    tooltip: popper.querySelector(Selectors.TOOLTIP) as HTMLDivElement,
    backdrop: popper.querySelector(Selectors.BACKDROP),
    content: popper.querySelector(Selectors.CONTENT) as HTMLDivElement,
    arrow:
      popper.querySelector(Selectors.ARROW) ||
      popper.querySelector(Selectors.ROUND_ARROW),
  }
}

/**
 * Adds `data-inertia` attribute
 */
export function addInertia(tooltip: PopperChildren['tooltip']) {
  tooltip.setAttribute('data-inertia', '')
}

/**
 * Removes `data-inertia` attribute
 */
export function removeInertia(tooltip: PopperChildren['tooltip']) {
  tooltip.removeAttribute('data-inertia')
}

/**
 * Creates an arrow element and returns it
 */
export function createArrowElement(arrowType: Props['arrowType']) {
  const arrow = div()
  if (arrowType === 'round') {
    arrow.className = 'tippy-roundarrow'
    setInnerHTML(
      arrow,
      '<svg viewBox="0 0 18 7" xmlns="http://www.w3.org/2000/svg"><path d="M0 7s2.021-.015 5.253-4.218C6.584 1.051 7.797.007 9 0c1.203-.007 2.416 1.035 3.761 2.782C16.012 7.005 18 7 18 7H0z"/></svg>',
    )
  } else {
    arrow.className = 'tippy-arrow'
  }
  return arrow
}

/**
 * Creates a backdrop element and returns it
 */
export function createBackdropElement() {
  const backdrop = div()
  backdrop.className = 'tippy-backdrop'
  backdrop.setAttribute('data-state', 'hidden')
  return backdrop
}

/**
 * Adds interactive-related attributes
 */
export function addInteractive(
  popper: PopperElement,
  tooltip: PopperChildren['tooltip'],
) {
  popper.setAttribute('tabindex', '-1')
  tooltip.setAttribute('data-interactive', '')
}

/**
 * Removes interactive-related attributes
 */
export function removeInteractive(
  popper: PopperElement,
  tooltip: PopperChildren['tooltip'],
) {
  popper.removeAttribute('tabindex')
  tooltip.removeAttribute('data-interactive')
}

/**
 * Applies a transition duration to a list of elements
 */
export function applyTransitionDuration(
  els: (HTMLDivElement | null)[],
  value: number,
) {
  els.forEach(el => {
    if (el) {
      el.style.transitionDuration = `${value}ms`
    }
  })
}

/**
 * Add/remove transitionend listener from tooltip
 */
export function toggleTransitionEndListener(
  tooltip: PopperChildren['tooltip'],
  action: 'add' | 'remove',
  listener: (event: TransitionEvent) => void,
) {
  // UC Browser hasn't adopted the `transitionend` event despite supporting
  // unprefixed transitions...
  const eventName =
    isUCBrowser && document.body.style.webkitTransition !== undefined
      ? 'webkitTransitionEnd'
      : 'transitionend'
  tooltip[
    (action + 'EventListener') as 'addEventListener' | 'removeEventListener'
  ](eventName, listener as EventListener)
}

/**
 * Returns the popper's placement, ignoring shifting (top-start, etc)
 */
export function getPopperPlacement(popper: PopperElement) {
  const fullPlacement = popper.getAttribute('x-placement')
  return (fullPlacement ? fullPlacement.split('-')[0] : '') as BasicPlacement
}

/**
 * Sets the visibility state to elements so they can begin to transition
 */
export function setVisibilityState(
  els: (HTMLDivElement | null)[],
  state: 'visible' | 'hidden',
) {
  els.forEach(el => {
    if (el) {
      el.setAttribute('data-state', state)
    }
  })
}

/**
 * Triggers reflow
 */
export function reflow(popper: PopperElement) {
  void popper.offsetHeight
}

/**
 * Adds/removes theme from tooltip's classList
 */
export function toggleTheme(
  tooltip: PopperChildren['tooltip'],
  action: 'add' | 'remove',
  theme: Props['theme'],
) {
  theme.split(' ').forEach(themeName => {
    tooltip.classList[action](themeName + '-theme')
  })
}

/**
 * Constructs the popper element and returns it
 */
export function createPopperElement(id: number, props: Props): PopperElement {
  const popper = div()
  popper.className = 'tippy-popper'
  popper.id = `tippy-${id}`
  popper.style.zIndex = '' + props.zIndex
  if (props.role) {
    popper.setAttribute('role', props.role)
  }

  const tooltip = div()
  tooltip.className = 'tippy-tooltip'
  tooltip.style.maxWidth =
    props.maxWidth + (typeof props.maxWidth === 'number' ? 'px' : '')
  tooltip.setAttribute('data-size', props.size)
  tooltip.setAttribute('data-animation', props.animation)
  tooltip.setAttribute('data-state', 'hidden')
  toggleTheme(tooltip, 'add', props.theme)

  const content = div()
  content.className = 'tippy-content'
  content.setAttribute('data-state', 'hidden')

  if (props.interactive) {
    addInteractive(popper, tooltip)
  }

  if (props.arrow) {
    tooltip.appendChild(createArrowElement(props.arrowType))
  }

  if (props.animateFill) {
    tooltip.appendChild(createBackdropElement())
    tooltip.setAttribute('data-animatefill', '')
  }

  if (props.inertia) {
    addInertia(tooltip)
  }

  setContent(content, props)

  tooltip.appendChild(content)
  popper.appendChild(tooltip)

  return popper
}

/**
 * Updates the popper element based on the new props
 */
export function updatePopperElement(
  popper: PopperElement,
  prevProps: Props,
  nextProps: Props,
) {
  const { tooltip, content, backdrop, arrow } = getChildren(popper)

  popper.style.zIndex = '' + nextProps.zIndex
  tooltip.setAttribute('data-size', nextProps.size)
  tooltip.setAttribute('data-animation', nextProps.animation)
  tooltip.style.maxWidth =
    nextProps.maxWidth + (typeof nextProps.maxWidth === 'number' ? 'px' : '')
  if (nextProps.role) {
    popper.setAttribute('role', nextProps.role)
  } else {
    popper.removeAttribute('role')
  }

  if (prevProps.content !== nextProps.content) {
    setContent(content, nextProps)
  }

  // animateFill
  if (!prevProps.animateFill && nextProps.animateFill) {
    tooltip.appendChild(createBackdropElement())
    tooltip.setAttribute('data-animatefill', '')
  } else if (prevProps.animateFill && !nextProps.animateFill) {
    tooltip.removeChild(backdrop!)
    tooltip.removeAttribute('data-animatefill')
  }

  // arrow
  if (!prevProps.arrow && nextProps.arrow) {
    tooltip.appendChild(createArrowElement(nextProps.arrowType))
  } else if (prevProps.arrow && !nextProps.arrow) {
    tooltip.removeChild(arrow!)
  }

  // arrowType
  if (
    prevProps.arrow &&
    nextProps.arrow &&
    prevProps.arrowType !== nextProps.arrowType
  ) {
    tooltip.replaceChild(createArrowElement(nextProps.arrowType), arrow!)
  }

  // interactive
  if (!prevProps.interactive && nextProps.interactive) {
    addInteractive(popper, tooltip)
  } else if (prevProps.interactive && !nextProps.interactive) {
    removeInteractive(popper, tooltip)
  }

  // inertia
  if (!prevProps.inertia && nextProps.inertia) {
    addInertia(tooltip)
  } else if (prevProps.inertia && !nextProps.inertia) {
    removeInertia(tooltip)
  }

  // theme
  if (prevProps.theme !== nextProps.theme) {
    toggleTheme(tooltip, 'remove', prevProps.theme)
    toggleTheme(tooltip, 'add', nextProps.theme)
  }
}

/**
 * Runs the callback after the popper's position has been updated
 * update() is debounced with Promise.resolve() or setTimeout()
 * scheduleUpdate() is update() wrapped in requestAnimationFrame()
 */
export function afterPopperPositionUpdates(
  popperInstance: PopperInstance,
  callback: () => void,
) {
  const { popper, options } = popperInstance
  const { onCreate, onUpdate } = options

  options.onCreate = options.onUpdate = (data: Popper.Data) => {
    reflow(popper)
    callback()

    if (onUpdate) {
      onUpdate(data)
    }

    options.onCreate = onCreate
    options.onUpdate = onUpdate
  }
}

/**
 * Hides all visible poppers on the document
 */
export function hideAll({
  checkHideOnClick,
  exclude,
  duration,
}: HideAllOptions = {}) {
  arrayFrom(document.querySelectorAll(Selectors.POPPER)).forEach(
    (popper: PopperElement) => {
      const instance = popper._tippy
      if (
        instance &&
        (checkHideOnClick ? instance.props.hideOnClick === true : true) &&
        (!exclude || popper !== exclude.popper)
      ) {
        instance.hide(duration)
      }
    },
  )
}

/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 */
export function isCursorOutsideInteractiveBorder(
  popperPlacement: BasicPlacement,
  popperRect: ClientRect,
  event: MouseEvent,
  props: Props,
) {
  if (!popperPlacement) {
    return true
  }

  const { clientX: x, clientY: y } = event
  const { interactiveBorder, distance } = props

  const exceedsTop =
    popperRect.top - y >
    (popperPlacement === 'top'
      ? interactiveBorder + distance
      : interactiveBorder)

  const exceedsBottom =
    y - popperRect.bottom >
    (popperPlacement === 'bottom'
      ? interactiveBorder + distance
      : interactiveBorder)

  const exceedsLeft =
    popperRect.left - x >
    (popperPlacement === 'left'
      ? interactiveBorder + distance
      : interactiveBorder)

  const exceedsRight =
    x - popperRect.right >
    (popperPlacement === 'right'
      ? interactiveBorder + distance
      : interactiveBorder)

  return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight
}

/**
 * Returns the distance offset, taking into account the default offset due to
 * the transform: translate() rule (10px) in CSS
 */
export function getOffsetDistanceInPx(distance: number) {
  return -(distance - 10) + 'px'
}
