import Selectors from './selectors'
import { arrayFrom } from './ponyfills'
import { innerHTML } from './utils'
import { isUCBrowser } from './browser'

/**
 * Returns a new `div` element
 * @return {HTMLDivElement}
 */
export function div() {
  return document.createElement('div')
}

/**
 * Sets the innerHTML of an element while tricking linters & minifiers
 * @param {HTMLElement} el
 * @param {Element|String} html
 */
export function setInnerHTML(el, html) {
  el[innerHTML()] = html instanceof Element ? html[innerHTML()] : html
}

/**
 * Sets the content of a tooltip
 * @param {HTMLElement} contentEl
 * @param {Object} props
 */
export function setContent(contentEl, props) {
  if (props.content instanceof Element) {
    setInnerHTML(contentEl, '')
    contentEl.appendChild(props.content)
  } else {
    contentEl[props.allowHTML ? 'innerHTML' : 'textContent'] = props.content
  }
}

/**
 * Returns the child elements of a popper element
 * @param {HTMLElement} popper
 * @return {Object}
 */
export function getChildren(popper) {
  return {
    tooltip: popper.querySelector(Selectors.TOOLTIP),
    backdrop: popper.querySelector(Selectors.BACKDROP),
    content: popper.querySelector(Selectors.CONTENT),
    arrow:
      popper.querySelector(Selectors.ARROW) ||
      popper.querySelector(Selectors.ROUND_ARROW),
  }
}

/**
 * Adds `data-inertia` attribute
 * @param {HTMLElement} tooltip
 */
export function addInertia(tooltip) {
  tooltip.setAttribute('data-inertia', '')
}

/**
 * Removes `data-inertia` attribute
 * @param {HTMLElement} tooltip
 */
export function removeInertia(tooltip) {
  tooltip.removeAttribute('data-inertia')
}

/**
 * Creates an arrow element and returns it
 * @return {HTMLDivElement}
 */
export function createArrowElement(arrowType) {
  const arrow = div()
  if (arrowType === 'round') {
    arrow.className = 'tippy-roundarrow'
    setInnerHTML(
      arrow,
      '<svg viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg"><path d="M3 8s2.021-.015 5.253-4.218C9.584 2.051 10.797 1.007 12 1c1.203-.007 2.416 1.035 3.761 2.782C19.012 8.005 21 8 21 8H3z"/></svg>',
    )
  } else {
    arrow.className = 'tippy-arrow'
  }
  return arrow
}

/**
 * Creates a backdrop element and returns it
 * @return {HTMLDivElement}
 */
export function createBackdropElement() {
  const backdrop = div()
  backdrop.className = 'tippy-backdrop'
  backdrop.setAttribute('data-state', 'hidden')
  return backdrop
}

/**
 * Adds interactive-related attributes
 * @param {HTMLElement} popper
 * @param {HTMLElement} tooltip
 */
export function addInteractive(popper, tooltip) {
  popper.setAttribute('tabindex', '-1')
  tooltip.setAttribute('data-interactive', '')
}

/**
 * Removes interactive-related attributes
 * @param {HTMLElement} popper
 * @param {HTMLElement} tooltip
 */
export function removeInteractive(popper, tooltip) {
  popper.removeAttribute('tabindex')
  tooltip.removeAttribute('data-interactive')
}

/**
 * Applies a transition duration to a list of elements
 * @param {Array} els
 * @param {Number} value
 */
export function applyTransitionDuration(els, value) {
  els.forEach(el => {
    if (el) {
      el.style.transitionDuration = `${value}ms`
    }
  })
}

/**
 * Add/remove transitionend listener from tooltip
 * @param {Element} tooltip
 * @param {String} action
 * @param {Function} listener
 */
export function toggleTransitionEndListener(tooltip, action, listener) {
  // UC Browser hasn't adopted the `transitionend` event despite supporting
  // unprefixed transitions...
  const eventName =
    isUCBrowser && document.body.style.WebkitTransition !== undefined
      ? 'webkitTransitionEnd'
      : 'transitionend'
  tooltip[action + 'EventListener'](eventName, listener)
}

/**
 * Returns the popper's placement, ignoring shifting (top-start, etc)
 * @param {Element} popper
 * @return {String}
 */
export function getPopperPlacement(popper) {
  const fullPlacement = popper.getAttribute('x-placement')
  return fullPlacement ? fullPlacement.split('-')[0] : ''
}

/**
 * Sets the visibility state to elements so they can begin to transition
 * @param {Array} els
 * @param {String} state
 */
export function setVisibilityState(els, state) {
  els.forEach(el => {
    if (el) {
      el.setAttribute('data-state', state)
    }
  })
}

/**
 * Triggers reflow
 * @param {Element} popper
 */
export function reflow(popper) {
  void popper.offsetHeight
}

/**
 * Adds/removes theme from tooltip's classList
 * @param {HTMLDivElement} tooltip
 * @param {String} action
 * @param {String} theme
 */
export function toggleTheme(tooltip, action, theme) {
  theme.split(' ').forEach(themeName => {
    tooltip.classList[action](themeName + '-theme')
  })
}

/**
 * Constructs the popper element and returns it
 * @param {Number} id
 * @param {Object} props
 * @return {HTMLDivElement}
 */
export function createPopperElement(id, props) {
  const popper = div()
  popper.className = 'tippy-popper'
  popper.id = `tippy-${id}`
  popper.style.zIndex = props.zIndex
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
 * @param {HTMLDivElement} popper
 * @param {Object} prevProps
 * @param {Object} nextProps
 */
export function updatePopperElement(popper, prevProps, nextProps) {
  const { tooltip, content, backdrop, arrow } = getChildren(popper)

  popper.style.zIndex = nextProps.zIndex
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
    tooltip.removeChild(backdrop)
    tooltip.removeAttribute('data-animatefill')
  }

  // arrow
  if (!prevProps.arrow && nextProps.arrow) {
    tooltip.appendChild(createArrowElement(nextProps.arrowType))
  } else if (prevProps.arrow && !nextProps.arrow) {
    tooltip.removeChild(arrow)
  }

  // arrowType
  if (
    prevProps.arrow &&
    nextProps.arrow &&
    prevProps.arrowType !== nextProps.arrowType
  ) {
    tooltip.replaceChild(createArrowElement(nextProps.arrowType), arrow)
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
 * @param {Popper} popperInstance
 * @param {Function} callback
 */
export function afterPopperPositionUpdates(popperInstance, callback) {
  const { popper, options } = popperInstance
  const { onCreate, onUpdate } = options

  options.onCreate = options.onUpdate = data => {
    reflow(popper)
    callback()
    onUpdate(data)
    options.onCreate = onCreate
    options.onUpdate = onUpdate
  }
}

/**
 * Hides all visible poppers on the document
 * @param {Object} options
 */
export function hideAll({ checkHideOnClick, exclude, duration } = {}) {
  arrayFrom(document.querySelectorAll(Selectors.POPPER)).forEach(popper => {
    const instance = popper._tippy
    if (
      instance &&
      (checkHideOnClick ? instance.props.hideOnClick === true : true) &&
      (!exclude || popper !== exclude.popper)
    ) {
      instance.hide(duration)
    }
  })
}

/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 * @param {String} popperPlacement
 * @param {ClientRect} popperRect
 * @param {MouseEvent} event
 * @param {Object} props
 * @return {Boolean}
 */
export function isCursorOutsideInteractiveBorder(
  popperPlacement,
  popperRect,
  event,
  props,
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
 * @param {Number} distance
 * @return {String}
 */
export function getOffsetDistanceInPx(distance) {
  return -(distance - 10) + 'px'
}
