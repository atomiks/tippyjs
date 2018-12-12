import Selectors from './selectors'
import { arrayFrom, closestCallback } from './ponyfills'

const FF_EXTENSION_TRICK = { x: true }

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
  el[FF_EXTENSION_TRICK.x && 'innerHTML'] =
    html instanceof Element ? html[FF_EXTENSION_TRICK.x && 'innerHTML'] : html
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
  tooltip[action + 'EventListener']('transitionend', listener)
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
 * Constructs the popper element and returns it
 * @param {Number} id
 * @param {Object} props
 */
export function createPopperElement(id, props) {
  const popper = div()
  popper.className = 'tippy-popper'
  popper.setAttribute('role', 'tooltip')
  popper.id = `tippy-${id}`
  popper.style.zIndex = props.zIndex

  const tooltip = div()
  tooltip.className = 'tippy-tooltip'
  tooltip.style.maxWidth =
    props.maxWidth + (typeof props.maxWidth === 'number' ? 'px' : '')
  tooltip.setAttribute('data-size', props.size)
  tooltip.setAttribute('data-animation', props.animation)
  tooltip.setAttribute('data-state', 'hidden')
  props.theme.split(' ').forEach(t => {
    tooltip.classList.add(t + '-theme')
  })

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

  popper.addEventListener('focusout', e => {
    if (
      e.relatedTarget &&
      popper._tippy &&
      !closestCallback(e.relatedTarget, el => el === popper) &&
      e.relatedTarget !== popper._tippy.reference &&
      popper._tippy.props.shouldPopperHideOnBlur(e)
    ) {
      popper._tippy.hide()
    }
  })

  return popper
}

/**
 * Updates the popper element based on the new props
 * @param {HTMLElement} popper
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
    prevProps.theme.split(' ').forEach(theme => {
      tooltip.classList.remove(theme + '-theme')
    })
    nextProps.theme.split(' ').forEach(theme => {
      tooltip.classList.add(theme + '-theme')
    })
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

  options.onCreate = options.onUpdate = () => {
    reflow(popper)
    callback()
    onUpdate()
    options.onCreate = onCreate
    options.onUpdate = onUpdate
  }
}

/**
 * Hides all visible poppers on the document, optionally excluding one
 * @param {Tippy} tippyInstanceToExclude
 */
export function hideAllPoppers(tippyInstanceToExclude) {
  arrayFrom(document.querySelectorAll(Selectors.POPPER)).forEach(popper => {
    const tip = popper._tippy
    if (
      tip &&
      tip.props.hideOnClick === true &&
      (!tippyInstanceToExclude || popper !== tippyInstanceToExclude.popper)
    ) {
      tip.hide()
    }
  })
}

/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 * @param {String} popperPlacement
 * @param {Object} popperRect
 * @param {MouseEvent} event
 * @param {Object} props
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
 * the transform: translate() rule in CSS
 * @param {Number} distance
 * @param {Number} defaultDistance
 */
export function getOffsetDistanceInPx(distance, defaultDistance) {
  return -(distance - defaultDistance) + 'px'
}
