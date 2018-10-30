import { Selectors } from './selectors'
import { Defaults } from './defaults'

/**
 * Firefox extensions doesn't allow 'innerHTML' to be set but we can trick it
 * + aid for minifiers not to remove the trick
 */
const FF_EXTENSION_TRICK = { x: true }

/**
 * Determines if the runtime is a browser
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Determines if the browser is supported
 */
export const isBrowserSupported = isBrowser && 'MutationObserver' in window

/**
 * Injects a string of CSS styles to the style node in the document head
 */
export const injectCSS = css => {
  if (isBrowserSupported) {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.textContent = css
    document.head.insertBefore(style, document.head.firstChild)
  }
}

/**
 * Ponyfill for Array.from; converts iterable values to an array
 */
export const toArray = value => [].slice.call(value)

/**
 * Sets the content of a tooltip
 */
export const setContent = (contentEl, props) => {
  if (props.content instanceof Element) {
    setInnerHTML(contentEl, '')
    contentEl.appendChild(props.content)
  } else {
    contentEl[props.allowHTML ? 'innerHTML' : 'textContent'] = props.content
  }
}

/**
 * Determines if an element can receive focus
 */
export const elementCanReceiveFocus = el =>
  el instanceof Element
    ? matches.call(
        el,
        'a[href],area[href],button,details,input,textarea,select,iframe,[tabindex]'
      ) && !el.hasAttribute('disabled')
    : true

/**
 * Applies a transition duration to a list of elements
 */
export const applyTransitionDuration = (els, value) => {
  els.filter(Boolean).forEach(el => {
    el.style.transitionDuration = `${value}ms`
  })
}

/**
 * Returns the child elements of a popper element
 */
export const getChildren = popper => {
  const select = s => popper.querySelector(s)
  return {
    tooltip: select(Selectors.TOOLTIP),
    backdrop: select(Selectors.BACKDROP),
    content: select(Selectors.CONTENT),
    arrow: select(Selectors.ARROW) || select(Selectors.ROUND_ARROW)
  }
}

/**
 * Determines if a value is a plain object
 */
export const isPlainObject = value =>
  ({}.toString.call(value) === '[object Object]')

/**
 * Creates and returns a div element
 */
export const div = () => document.createElement('div')

/**
 * Sets the innerHTML of an element while tricking linters & minifiers
 */
export const setInnerHTML = (el, html) => {
  el[FF_EXTENSION_TRICK.x && 'innerHTML'] =
    html instanceof Element ? html[FF_EXTENSION_TRICK.x && 'innerHTML'] : html
}

/**
 * Returns an array of elements based on the value
 */
export const getArrayOfElements = value => {
  if (value instanceof Element || isPlainObject(value)) {
    return [value]
  }
  if (value instanceof NodeList) {
    return toArray(value)
  }
  if (Array.isArray(value)) {
    return value
  }

  try {
    return toArray(document.querySelectorAll(value))
  } catch (e) {
    return []
  }
}

/**
 * Determines if a value is numeric
 */
export const isNumeric = value => !isNaN(value) && !isNaN(parseFloat(value))

/**
 * Returns a value at a given index depending on if it's an array or number
 */
export const getValue = (value, index, defaultValue) => {
  if (Array.isArray(value)) {
    const v = value[index]
    return v == null ? defaultValue : v
  }
  return value
}

/**
 * Creates an arrow element and returns it
 */
export const createArrowElement = arrowType => {
  const arrow = div()
  if (arrowType === 'round') {
    arrow.className = 'tippy-roundarrow'
    setInnerHTML(
      arrow,
      '<svg viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg"><path d="M3 8s2.021-.015 5.253-4.218C9.584 2.051 10.797 1.007 12 1c1.203-.007 2.416 1.035 3.761 2.782C19.012 8.005 21 8 21 8H3z"/></svg>'
    )
  } else {
    arrow.className = 'tippy-arrow'
  }
  return arrow
}

/**
 * Creates a backdrop element and returns it
 */
export const createBackdropElement = () => {
  const backdrop = div()
  backdrop.className = 'tippy-backdrop'
  backdrop.setAttribute('data-state', 'hidden')
  return backdrop
}

/**
 * Adds interactive attributes
 */
export const addInteractive = (popper, tooltip) => {
  popper.setAttribute('tabindex', '-1')
  tooltip.setAttribute('data-interactive', '')
}

/**
 * Removes interactive attributes
 */
export const removeInteractive = (popper, tooltip) => {
  popper.removeAttribute('tabindex')
  tooltip.removeAttribute('data-interactive')
}

/**
 * Adds inertia attribute
 */
export const addInertia = tooltip => {
  tooltip.setAttribute('data-inertia', '')
}

/**
 * Removes inertia attribute
 */
export const removeInertia = tooltip => {
  tooltip.removeAttribute('data-inertia')
}

/**
 * Constructs the popper element and returns it
 */
export const createPopperElement = (id, props) => {
  const popper = div()
  popper.className = 'tippy-popper'
  popper.setAttribute('role', 'tooltip')
  popper.id = `tippy-${id}`
  popper.style.zIndex = props.zIndex

  const tooltip = div()
  tooltip.className = 'tippy-tooltip'
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
    tooltip.setAttribute('data-inertia', '')
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
 */
export const updatePopperElement = (popper, prevProps, nextProps) => {
  const { tooltip, content, backdrop, arrow } = getChildren(popper)

  popper.style.zIndex = nextProps.zIndex
  tooltip.setAttribute('data-size', nextProps.size)
  tooltip.setAttribute('data-animation', nextProps.animation)

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
 * Hides all visible poppers on the document
 */
export const hideAllPoppers = excludeTippy => {
  toArray(document.querySelectorAll(Selectors.POPPER)).forEach(popper => {
    const tip = popper._tippy
    if (
      tip &&
      tip.props.hideOnClick === true &&
      (!excludeTippy || popper !== excludeTippy.popper)
    ) {
      tip.hide()
    }
  })
}

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
export const getDataAttributeOptions = reference =>
  Object.keys(Defaults).reduce((acc, key) => {
    const valueAsString = (
      reference.getAttribute(`data-tippy-${key}`) || ''
    ).trim()

    if (!valueAsString) {
      return acc
    }

    if (key === 'content') {
      acc[key] = valueAsString
    } else if (valueAsString === 'true') {
      acc[key] = true
    } else if (valueAsString === 'false') {
      acc[key] = false
    } else if (isNumeric(valueAsString)) {
      acc[key] = Number(valueAsString)
    } else if (valueAsString[0] === '[' || valueAsString[0] === '{') {
      acc[key] = JSON.parse(valueAsString)
    } else {
      acc[key] = valueAsString
    }

    return acc
  }, {})

/**
 * Polyfills the virtual reference (plain object) with needed props
 * Mutating because DOM elements are mutated, adds _tippy property
 */
export const polyfillVirtualReferenceProps = virtualReference => {
  const polyfills = {
    isVirtual: true,
    attributes: virtualReference.attributes || {},
    setAttribute(key, value) {
      virtualReference.attributes[key] = value
    },
    getAttribute(key) {
      return virtualReference.attributes[key]
    },
    removeAttribute(key) {
      delete virtualReference.attributes[key]
    },
    hasAttribute(key) {
      return key in virtualReference.attributes
    },
    addEventListener() {},
    removeEventListener() {},
    classList: {
      classNames: {},
      add(key) {
        virtualReference.classList.classNames[key] = true
      },
      remove(key) {
        delete virtualReference.classList.classNames[key]
      },
      contains(key) {
        return key in virtualReference.classList.classNames
      }
    }
  }

  for (const key in polyfills) {
    virtualReference[key] = polyfills[key]
  }

  return virtualReference
}

/**
 * Ponyfill for Element.prototype.matches
 */
export const matches = (() => {
  if (isBrowser) {
    const e = Element.prototype
    return (
      e.matches ||
      e.matchesSelector ||
      e.webkitMatchesSelector ||
      e.mozMatchesSelector ||
      e.msMatchesSelector
    )
  }
})()

/**
 * Ponyfill for Element.prototype.closest
 */
export const closest = (element, parentSelector) =>
  (
    Element.prototype.closest ||
    function(selector) {
      let el = this
      while (el) {
        if (matches.call(el, selector)) return el
        el = el.parentElement
      }
    }
  ).call(element, parentSelector)

/**
 * Works like Element.prototype.closest, but uses a callback instead
 */
export const closestCallback = (element, callback) => {
  while (element) {
    if (callback(element)) return element
    element = element.parentElement
  }
}

/**
 * Focuses an element while preventing a scroll jump if it's not within the viewport
 */
export const focus = el => {
  const x = window.scrollX || window.pageXOffset
  const y = window.scrollY || window.pageYOffset
  el.focus()
  scroll(x, y)
}

/**
 * Triggers reflow
 */
export const reflow = popper => {
  void popper.offsetHeight
}

/**
 * Transforms the x/y axis ased on the placement
 */
export const transformAxisBasedOnPlacement = (axis, isVertical) =>
  (isVertical
    ? axis
    : {
        X: 'Y',
        Y: 'X'
      }[axis]) || ''

/**
 * Transforms the scale/translate numbers based on the placement
 */
export const transformNumbersBasedOnPlacement = (
  type,
  numbers,
  isVertical,
  isReverse
) => {
  /**
   * Avoid destructuring because a large boilerplate function is generated
   * by Babel
   */
  const a = numbers[0]
  const b = numbers[1]

  if (!a && !b) {
    return ''
  }

  const transforms = {
    scale: (() => {
      if (!b) {
        return `${a}`
      } else {
        return isVertical ? `${a}, ${b}` : `${b}, ${a}`
      }
    })(),
    translate: (() => {
      if (!b) {
        return isReverse ? `${-a}px` : `${a}px`
      } else {
        if (isVertical) {
          return isReverse ? `${a}px, ${-b}px` : `${a}px, ${b}px`
        } else {
          return isReverse ? `${-b}px, ${a}px` : `${b}px, ${a}px`
        }
      }
    })()
  }

  return transforms[type]
}

/**
 * Returns the axis for a CSS function (translate or scale)
 */
export const getTransformAxis = (str, cssFunction) => {
  const match = str.match(new RegExp(cssFunction + '([XY])'))
  return match ? match[1] : ''
}

/**
 * Returns the numbers given to the CSS function
 */
export const getTransformNumbers = (str, regex) => {
  const match = str.match(regex)
  return match ? match[1].split(',').map(parseFloat) : []
}

export const TRANSFORM_NUMBER_RE = {
  translate: /translateX?Y?\(([^)]+)\)/,
  scale: /scaleX?Y?\(([^)]+)\)/
}

/**
 * Computes the arrow's transform so that it is correct for any placement
 */
export const computeArrowTransform = (arrow, arrowTransform) => {
  const placement = getPopperPlacement(closest(arrow, Selectors.POPPER))
  const isVertical = placement === 'top' || placement === 'bottom'
  const isReverse = placement === 'right' || placement === 'bottom'

  const matches = {
    translate: {
      axis: getTransformAxis(arrowTransform, 'translate'),
      numbers: getTransformNumbers(
        arrowTransform,
        TRANSFORM_NUMBER_RE.translate
      )
    },
    scale: {
      axis: getTransformAxis(arrowTransform, 'scale'),
      numbers: getTransformNumbers(arrowTransform, TRANSFORM_NUMBER_RE.scale)
    }
  }

  const computedTransform = arrowTransform
    .replace(
      TRANSFORM_NUMBER_RE.translate,
      `translate${transformAxisBasedOnPlacement(
        matches.translate.axis,
        isVertical
      )}(${transformNumbersBasedOnPlacement(
        'translate',
        matches.translate.numbers,
        isVertical,
        isReverse
      )})`
    )
    .replace(
      TRANSFORM_NUMBER_RE.scale,
      `scale${transformAxisBasedOnPlacement(
        matches.scale.axis,
        isVertical
      )}(${transformNumbersBasedOnPlacement(
        'scale',
        matches.scale.numbers,
        isVertical,
        isReverse
      )})`
    )

  arrow.style[
    typeof document.body.style.transform !== 'undefined'
      ? 'transform'
      : 'webkitTransform'
  ] = computedTransform
}

/**
 * Sets the visibility state of a popper so it can begin to transition in or out
 */
export const setVisibilityState = (els, type) => {
  els.filter(Boolean).forEach(el => {
    el.setAttribute('data-state', type)
  })
}

/**
 * Runs the callback after the popper's position has been updated
 * update() is debounced with setTimeout(0) and scheduleUpdate() is
 * update() wrapped in requestAnimationFrame().
 */
export const afterPopperPositionUpdates = (popperInstance, callback) => {
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
 * Defers a function's execution until the call stack has cleared
 */
export const defer = fn => {
  setTimeout(fn, 1)
}

/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 */
export const isCursorOutsideInteractiveBorder = (
  popperPlacement,
  popperRect,
  event,
  props
) => {
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
 */
export const getOffsetDistanceInPx = (distance, defaultDistance) =>
  -(distance - defaultDistance) + 'px'

/**
 * Returns the popper's placement, ignoring shifting (top-start, etc)
 */
export const getPopperPlacement = popper => {
  const fullPlacement = popper.getAttribute('x-placement')
  return fullPlacement ? fullPlacement.split('-')[0] : ''
}

/**
 * Evaluates props
 */
export const evaluateProps = (reference, props) => {
  const out = {
    ...props,
    ...(props.performance ? {} : getDataAttributeOptions(reference))
  }

  if (out.arrow) {
    out.animateFill = false
  }

  if (typeof out.appendTo === 'function') {
    out.appendTo = props.appendTo(reference)
  }

  if (typeof out.content === 'function') {
    out.content = props.content(reference)
  }

  return out
}

/**
 * Add/remove transitionend listener from tooltip
 */
export const toggleTransitionEndListener = (tooltip, action, listener) => {
  tooltip[action + 'EventListener']('transitionend', listener)
}

/**
 * Debounce utility
 */
export const debounce = (fn, ms) => {
  let timeoutId
  return function() {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, arguments), ms)
  }
}

/**
 * Validates an object of options with the valid default props object
 */
export const validateOptions = (options, props) => {
  for (const option in options || {}) {
    if (!(option in props)) {
      throw Error(`[tippy]: \`${option}\` is not a valid option`)
    }
  }
}
