/**!
 * tippy.js v5.0.0-alpha.0
 * (c) 2017-2019 atomiks
 * MIT License
 */
import Popper from 'popper.js'

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }

      return target
    }

  return _extends.apply(this, arguments)
}

var version = '5.0.0-alpha.0'

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
var ua = isBrowser ? navigator.userAgent : ''
var isIE = /MSIE |Trident\//.test(ua)
var isUCBrowser = /UCBrowser\//.test(ua)
var isIOS =
  isBrowser && /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream

var defaultProps = {
  allowHTML: true,
  animateFill: true,
  animation: 'shift-away',
  appendTo: function appendTo() {
    return document.body
  },
  aria: 'describedby',
  arrow: false,
  arrowType: 'sharp',
  boundary: 'scrollParent',
  content: '',
  delay: 0,
  distance: 10,
  duration: [325, 275],
  flip: true,
  flipBehavior: 'flip',
  flipOnUpdate: false,
  followCursor: false,
  hideOnClick: true,
  ignoreAttributes: false,
  inertia: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  lazy: true,
  maxWidth: 350,
  multiple: false,
  offset: 0,
  onCreate: function onCreate() {},
  onHidden: function onHidden() {},
  onHide: function onHide() {},
  onMount: function onMount() {},
  onShow: function onShow() {},
  onShown: function onShown() {},
  onTrigger: function onTrigger() {},
  onUntrigger: function onUntrigger() {},
  placement: 'top',
  popperOptions: {},
  role: 'tooltip',
  showOnInit: false,
  size: 'regular',
  sticky: false,
  theme: 'tippy-dark',
  touch: true,
  touchHold: false,
  trigger: 'mouseenter focus',
  triggerTarget: null,
  updateDuration: 0,
  wait: null,
  zIndex: 9999,
  /**
   * If the set() method encounters one of these, the popperInstance must be
   * recreated
   */
}
var POPPER_INSTANCE_DEPENDENCIES = [
  'arrow',
  'arrowType',
  'boundary',
  'distance',
  'flip',
  'flipBehavior',
  'flipOnUpdate',
  'offset',
  'placement',
  'popperOptions',
]

/**
 * Ponyfill for Array.from - converts iterable values to an array
 */
function arrayFrom(value) {
  return [].slice.call(value)
}
/**
 * Works like Element.prototype.closest, but uses a callback instead
 */

function closestCallback(element, callback) {
  while (element) {
    if (callback(element)) {
      return element
    }

    element = element.parentElement
  }

  return null
}

// Passive event listener config
var PASSIVE = {
  passive: true, // Popper `preventOverflow` padding
}
var PADDING = 4 // Classes

var IOS_CLASS = 'tippy-iOS'
var POPPER_CLASS = 'tippy-popper'
var TOOLTIP_CLASS = 'tippy-tooltip'
var CONTENT_CLASS = 'tippy-content'
var BACKDROP_CLASS = 'tippy-backdrop'
var ARROW_CLASS = 'tippy-arrow'
var SVG_ARROW_CLASS = 'tippy-svgArrow' // Selectors

var POPPER_SELECTOR = '.'.concat(POPPER_CLASS)
var TOOLTIP_SELECTOR = '.'.concat(TOOLTIP_CLASS)
var CONTENT_SELECTOR = '.'.concat(CONTENT_CLASS)
var BACKDROP_SELECTOR = '.'.concat(BACKDROP_CLASS)
var ARROW_SELECTOR = '.'.concat(ARROW_CLASS)
var SVG_ARROW_SELECTOR = '.'.concat(SVG_ARROW_CLASS)

var isUsingTouch = false
var lastMouseMoveTime = 0
/**
 * When a `touchstart` event is fired, it's assumed the user is using touch
 * input. We'll bind a `mousemove` event listener to listen for mouse input in
 * the future. This way, the `isUsingTouch` variable is fully dynamic and will
 * handle hybrid devices that use a mix of touch + mouse input.
 */

function onDocumentTouchStart() {
  if (isUsingTouch) {
    return
  }

  isUsingTouch = true

  if (isIOS) {
    document.body.classList.add(IOS_CLASS)
  }

  if (window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove)
  }
}
/**
 * When two `mousemove` event are fired consecutively within 20ms, it's assumed
 * the user is using mouse input again. `mousemove` can fire on touch devices as
 * well, but very rarely that quickly.
 */

function onDocumentMouseMove() {
  var now = performance.now()

  if (now - lastMouseMoveTime < 20) {
    isUsingTouch = false
    document.removeEventListener('mousemove', onDocumentMouseMove)

    if (!isIOS) {
      document.body.classList.remove(IOS_CLASS)
    }
  }

  lastMouseMoveTime = now
}
/**
 * When an element is in focus and has a tippy, leaving the tab/window and
 * returning causes it to show again. For mouse users this is unexpected, but
 * for keyboard use it makes sense.
 * TODO: find a better technique to solve this problem
 */

function onWindowBlur() {
  var _document = document,
    activeElement = _document.activeElement

  if (activeElement && activeElement.blur && activeElement._tippy) {
    activeElement.blur()
  }
}
/**
 * Adds the needed global event listeners
 */

function bindGlobalEventListeners() {
  document.addEventListener('touchstart', onDocumentTouchStart, PASSIVE)
  window.addEventListener('blur', onWindowBlur)
}

var keys = Object.keys(defaultProps)
/**
 * Returns an object of optional props from data-tippy-* attributes
 */

function getDataAttributeProps(reference) {
  return keys.reduce(function(acc, key) {
    var valueAsString = (
      reference.getAttribute('data-tippy-'.concat(key)) || ''
    ).trim()

    if (!valueAsString) {
      return acc
    }

    if (key === 'content') {
      acc[key] = valueAsString
    } else {
      try {
        acc[key] = JSON.parse(valueAsString)
      } catch (e) {
        acc[key] = valueAsString
      }
    }

    return acc
  }, {})
}

/**
 * Determines if the value is a reference element
 */

function isReferenceElement(value) {
  return !!(value && value._tippy && !value.classList.contains(POPPER_CLASS))
}
/**
 * Safe .hasOwnProperty check, for prototype-less objects
 */

function hasOwnProperty(obj, key) {
  return {}.hasOwnProperty.call(obj, key)
}
/**
 * Returns an array of elements based on the value
 */

function getArrayOfElements(value) {
  if (isRealElement(value)) {
    return [value]
  }

  if (value instanceof NodeList) {
    return arrayFrom(value)
  }

  if (Array.isArray(value)) {
    return value
  }

  try {
    return arrayFrom(document.querySelectorAll(value))
  } catch (e) {
    return []
  }
}
/**
 * Returns a value at a given index depending on if it's an array or number
 */

function getValue(value, index, defaultValue) {
  if (Array.isArray(value)) {
    var v = value[index]
    return v == null ? defaultValue : v
  }

  return value
}
/**
 * Prevents errors from being thrown while accessing nested modifier objects
 * in `popperOptions`
 */

function getModifier(obj, key) {
  return obj && obj.modifiers && obj.modifiers[key]
}
/**
 * Determines if an array or string includes a value
 */

function includes(a, b) {
  return a.indexOf(b) > -1
}
/**
 * Determines if the value is a real element
 */

function isRealElement(value) {
  return value instanceof Element
}
/**
 * Firefox extensions don't allow setting .innerHTML directly, this will trick
 * it
 */

function innerHTML() {
  return 'innerHTML'
}
/**
 * Evaluates a function if one, or returns the value
 */

function invokeWithArgsOrReturn(value, args) {
  return typeof value === 'function' ? value.apply(null, args) : value
}
/**
 * Sets a popperInstance `flip` modifier's enabled state
 */

function setFlipModifierEnabled(modifiers, value) {
  modifiers.filter(function(m) {
    return m.name === 'flip'
  })[0].enabled = value
}
/**
 * Returns a new `div` element
 */

function div() {
  return document.createElement('div')
}
/**
 * Applies a transition duration to a list of elements
 */

function setTransitionDuration(els, value) {
  els.forEach(function(el) {
    if (el) {
      el.style.transitionDuration = ''.concat(value, 'ms')
    }
  })
}
/**
 * Sets the visibility state to elements so they can begin to transition
 */

function setVisibilityState(els, state) {
  els.forEach(function(el) {
    if (el) {
      el.setAttribute('data-state', state)
    }
  })
}
/**
 * Evaluates the props object by merging data attributes and disabling
 * conflicting props where necessary
 */

function evaluateProps(reference, props) {
  var out = _extends(
    {},
    props,
    {
      content: invokeWithArgsOrReturn(props.content, [reference]),
    },
    props.ignoreAttributes ? {} : getDataAttributeProps(reference),
  )

  if (out.arrow || isUCBrowser) {
    out.animateFill = false
  }

  return out
}
/**
 * Debounce utility. To avoid bloating bundle size, we're only passing 1
 * argument here, a more generic function would pass all arguments. Only
 * `onMouseMove` uses this which takes the event object for now.
 */

function debounce(fn, ms) {
  // Avoid wrapping in `setTimeout` if ms is 0 anyway
  if (ms === 0) {
    return fn
  }

  var timeout
  return function(arg) {
    clearTimeout(timeout)
    timeout = setTimeout(function() {
      fn(arg)
    }, ms)
  }
}
/**
 * Helpful wrapper around `console.warn()`
 */

function warnWhen(condition, message) {
  if (condition) {
    /* eslint-disable-next-line no-console */
    console.warn('[tippy.js WARNING] '.concat(message))
  }
}

/**
 * Sets the innerHTML of an element
 */

function setInnerHTML(element, html) {
  element[innerHTML()] = isRealElement(html) ? html[innerHTML()] : html
}
/**
 * Sets the content of a tooltip
 */

function setContent(contentEl, props) {
  if (isRealElement(props.content)) {
    setInnerHTML(contentEl, '')
    contentEl.appendChild(props.content)
  } else if (typeof props.content !== 'function') {
    var key = props.allowHTML ? 'innerHTML' : 'textContent'
    contentEl[key] = props.content
  }
}
/**
 * Returns the child elements of a popper element
 */

function getChildren(popper) {
  return {
    tooltip: popper.querySelector(TOOLTIP_SELECTOR),
    backdrop: popper.querySelector(BACKDROP_SELECTOR),
    content: popper.querySelector(CONTENT_SELECTOR),
    arrow:
      popper.querySelector(ARROW_SELECTOR) ||
      popper.querySelector(SVG_ARROW_SELECTOR),
  }
}
/**
 * Adds `data-inertia` attribute
 */

function addInertia(tooltip) {
  tooltip.setAttribute('data-inertia', '')
}
/**
 * Removes `data-inertia` attribute
 */

function removeInertia(tooltip) {
  tooltip.removeAttribute('data-inertia')
}
/**
 * Creates an arrow element and returns it
 */

function createArrowElement(arrowType) {
  var arrow = div()

  if (arrowType !== 'sharp') {
    arrow.className = SVG_ARROW_CLASS // Use the built-in round SVG shape

    if (arrowType === 'round') {
      setInnerHTML(
        arrow,
        '<svg viewBox="0 0 18 7" xmlns="http://www.w3.org/2000/svg"><path d="M0 7s2.021-.015 5.253-4.218C6.584 1.051 7.797.007 9 0c1.203-.007 2.416 1.035 3.761 2.782C16.012 7.005 18 7 18 7H0z"/></svg>',
      )
    } else {
      // Assume they're specifying their own SVG shape
      setInnerHTML(arrow, arrowType)
    }
  } else {
    arrow.className = ARROW_CLASS
  }

  return arrow
}
/**
 * Creates a backdrop element and returns it
 */

function createBackdropElement(isVisible) {
  var backdrop = div()
  backdrop.className = BACKDROP_CLASS
  backdrop.setAttribute('data-state', isVisible ? 'visible' : 'hidden')
  return backdrop
}
/**
 * Adds interactive-related attributes
 */

function addInteractive(tooltip) {
  tooltip.setAttribute('data-interactive', '')
}
/**
 * Removes interactive-related attributes
 */

function removeInteractive(tooltip) {
  tooltip.removeAttribute('data-interactive')
}
/**
 * Add/remove transitionend listener from tooltip
 */

function updateTransitionEndListener(tooltip, action, listener) {
  var eventName =
    isUCBrowser && document.body.style.webkitTransition !== undefined
      ? 'webkitTransitionEnd'
      : 'transitionend'
  tooltip[action + 'EventListener'](eventName, listener)
}
/**
 * Returns the popper's placement, ignoring shifting (top-start, etc)
 */

function getBasicPlacement(placement) {
  return placement.split('-')[0]
}
/**
 * Triggers reflow
 */

function reflow(popper) {
  void popper.offsetHeight
}
/**
 * Adds/removes theme from tooltip's classList
 */

function updateTheme(tooltip, action, theme) {
  theme.split(' ').forEach(function(name) {
    tooltip.classList[action](name + '-theme')
  })
}
/**
 * Constructs the popper element and returns it
 */

function createPopperElement(id, props) {
  var popper = div()
  popper.className = POPPER_CLASS
  var tooltip = div()
  tooltip.className = TOOLTIP_CLASS
  tooltip.id = 'tippy-'.concat(id)
  tooltip.setAttribute('data-state', 'hidden')
  updateTheme(tooltip, 'add', props.theme)
  var content = div()
  content.className = CONTENT_CLASS
  content.setAttribute('data-state', 'hidden')

  if (props.interactive) {
    addInteractive(tooltip)
  }

  if (props.arrow) {
    tooltip.setAttribute('data-arrow', '')
    tooltip.appendChild(createArrowElement(props.arrowType))
  }

  if (props.animateFill) {
    tooltip.appendChild(createBackdropElement(false))
    tooltip.setAttribute('data-animatefill', '')
  }

  if (props.inertia) {
    addInertia(tooltip)
  }

  setContent(content, props)
  tooltip.appendChild(content)
  popper.appendChild(tooltip)
  updatePopperElement(popper, props, props, false)
  return popper
}
/**
 * Updates the popper element based on the new props
 */

function updatePopperElement(popper, prevProps, nextProps, isVisible) {
  var _getChildren = getChildren(popper),
    tooltip = _getChildren.tooltip,
    content = _getChildren.content,
    backdrop = _getChildren.backdrop,
    arrow = _getChildren.arrow

  popper.style.zIndex = '' + nextProps.zIndex
  tooltip.setAttribute('data-size', nextProps.size)
  tooltip.setAttribute('data-animation', nextProps.animation)
  tooltip.style.maxWidth =
    nextProps.maxWidth + (typeof nextProps.maxWidth === 'number' ? 'px' : '')

  if (nextProps.role) {
    tooltip.setAttribute('role', nextProps.role)
  } else {
    tooltip.removeAttribute('role')
  }

  if (prevProps.content !== nextProps.content) {
    setContent(content, nextProps)
  } // animateFill

  if (!prevProps.animateFill && nextProps.animateFill) {
    tooltip.appendChild(createBackdropElement(isVisible))
    tooltip.setAttribute('data-animatefill', '')
  } else if (prevProps.animateFill && !nextProps.animateFill) {
    tooltip.removeChild(backdrop)
    tooltip.removeAttribute('data-animatefill')
  } // arrow

  if (!prevProps.arrow && nextProps.arrow) {
    tooltip.appendChild(createArrowElement(nextProps.arrowType))
    tooltip.setAttribute('data-arrow', '')
  } else if (prevProps.arrow && !nextProps.arrow) {
    tooltip.removeChild(arrow)
    tooltip.removeAttribute('data-arrow')
  } // arrowType

  if (
    prevProps.arrow &&
    nextProps.arrow &&
    prevProps.arrowType !== nextProps.arrowType
  ) {
    tooltip.replaceChild(createArrowElement(nextProps.arrowType), arrow)
  } // interactive

  if (!prevProps.interactive && nextProps.interactive) {
    addInteractive(tooltip)
  } else if (prevProps.interactive && !nextProps.interactive) {
    removeInteractive(tooltip)
  } // inertia

  if (!prevProps.inertia && nextProps.inertia) {
    addInertia(tooltip)
  } else if (prevProps.inertia && !nextProps.inertia) {
    removeInertia(tooltip)
  } // theme

  if (prevProps.theme !== nextProps.theme) {
    updateTheme(tooltip, 'remove', prevProps.theme)
    updateTheme(tooltip, 'add', nextProps.theme)
  }
}
/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 */

function isCursorOutsideInteractiveBorder(
  popperPlacement,
  popperRect,
  event,
  props,
) {
  if (!popperPlacement) {
    return true
  }

  var x = event.clientX,
    y = event.clientY
  var interactiveBorder = props.interactiveBorder,
    distance = props.distance
  var exceedsTop =
    popperRect.top - y >
    (popperPlacement === 'top'
      ? interactiveBorder + distance
      : interactiveBorder)
  var exceedsBottom =
    y - popperRect.bottom >
    (popperPlacement === 'bottom'
      ? interactiveBorder + distance
      : interactiveBorder)
  var exceedsLeft =
    popperRect.left - x >
    (popperPlacement === 'left'
      ? interactiveBorder + distance
      : interactiveBorder)
  var exceedsRight =
    x - popperRect.right >
    (popperPlacement === 'right'
      ? interactiveBorder + distance
      : interactiveBorder)
  return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight
}

/**
 * Validates props with the valid `defaultProps` object
 */

function validateProps() {
  var partialProps =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  Object.keys(partialProps).forEach(function(prop) {
    var value = partialProps[prop]
    var didPassTargetprop = prop === 'target'
    var didPassA11yprop = prop === 'a11y'
    var didPassOtherUnknownprop =
      !hasOwnProperty(defaultProps, prop) &&
      prop !== 'target' &&
      prop !== 'a11y'
    var didPassOldThemeName =
      prop === 'theme' &&
      includes(['dark', 'light', 'light-border', 'translucent'], value)
    var didPassGoogleTheme = prop === 'theme' && value === 'google'
    warnWhen(
      didPassTargetprop,
      'The `target` prop was removed in v5 and ' +
        'replaced with the `delegate()` method. Read more here: ' +
        'https//atomiks.github.io/tippyjs/addons#event-delegation',
    )
    warnWhen(
      didPassA11yprop,
      'The `a11y` prop was removed in v5. Make ' +
        'sure the element you are giving a tippy to is natively ' +
        'focusable, such as <button> or <input>, not <div> or <span>.',
    )
    warnWhen(
      didPassOtherUnknownprop,
      '`' +
        prop +
        '` is not a valid prop. You ' +
        'may have spelled it incorrectly. View all of the valid props ' +
        'here: https://atomiks.github.io/tippyjs/all-props/',
    )
    warnWhen(
      didPassOldThemeName,
      'The default theme `' +
        value +
        '` in v5 must include the prefix `tippy`, i.e. ' +
        '"tippy-' +
        value +
        '" instead of "' +
        value +
        '".',
    )
    warnWhen(
      didPassGoogleTheme,
      'The default theme `google` was renamed to ' + '`tippy-material` in v5.',
    )
  })
}
/**
 * Validates the `targets` value passed to `tippy()`
 */

function validateTargets(targets) {
  var didPassFalsyValue = !targets
  var didPassPlainObject =
    Object.prototype.toString.call(targets) === '[object Object]' &&
    !targets.addEventListener
  warnWhen(
    didPassFalsyValue,
    '`tippy()` was passed `' +
      targets +
      '` (an invalid falsy value) as its targets argument. Valid types are: ' +
      'String (CSS selector), Element, Element[], or NodeList.',
  )
  warnWhen(
    didPassPlainObject,
    '`tippy()` was passed a plain object (virtual ' +
      'reference element) which is no longer supported in v5. Instead, pass ' +
      'a placeholder element like `document.createElement("div")`',
  )
}

var idCounter = 1 // Workaround for IE11's lack of new MouseEvent constructor

var mouseMoveListeners = []
/**
 * Creates and returns a Tippy object. We're using a closure pattern instead of
 * a class so that the exposed object API is clean without private members
 * prefixed with `_`.
 */

function createTippy(reference, collectionProps) {
  var props = evaluateProps(reference, collectionProps) // If the reference shouldn't have multiple tippys, return null early

  if (!props.multiple && reference._tippy) {
    return null
  }
  /* ======================= 🔒 Private members 🔒 ======================= */

  var lastTriggerEventType
  var lastMouseMoveEvent
  var showTimeout
  var hideTimeout
  var animationFrame
  var isScheduledToShow = false
  var currentPlacement = props.placement
  var hasMountCallbackRun = false
  var currentMountCallback
  var currentTransitionEndListener
  var listeners = []
  var debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce)
  var currentComputedPadding
  /* ======================= 🔑 Public members 🔑 ======================= */

  var id = idCounter++
  var popper = createPopperElement(id, props)
  var popperChildren = getChildren(popper)
  var popperInstance = null // These two elements are static

  var tooltip = popperChildren.tooltip,
    content = popperChildren.content
  var state = {
    // Is the instance currently enabled?
    isEnabled: true,
    // Is the tippy currently showing and not transitioning out?
    isVisible: false,
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the tippy currently mounted to the DOM?
    isMounted: false,
    // Has the tippy finished transitioning in?
    isShown: false,
  }
  var instance = {
    // properties
    id: id,
    reference: reference,
    popper: popper,
    popperChildren: popperChildren,
    popperInstance: popperInstance,
    props: props,
    state: state,
    // methods
    clearDelayTimeouts: clearDelayTimeouts,
    setProps: setProps,
    setContent: setContent,
    show: show,
    hide: hide,
    enable: enable,
    disable: disable,
    destroy: destroy,
    /* ==================== Initial instance mutations =================== */
  }
  reference._tippy = instance
  popper._tippy = instance
  addTriggersToEventListenersTarget()

  if (!props.lazy) {
    createPopperInstance()
  }

  if (props.showOnInit) {
    scheduleShow()
  } // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding

  popper.addEventListener('mouseenter', function() {
    if (
      instance.props.interactive &&
      instance.state.isVisible &&
      lastTriggerEventType === 'mouseenter'
    ) {
      instance.clearDelayTimeouts()
    }
  })
  popper.addEventListener('mouseleave', function() {
    if (instance.props.interactive && lastTriggerEventType === 'mouseenter') {
      document.addEventListener('mousemove', debouncedOnMouseMove)
    }
  })
  props.onCreate(instance)
  return instance
  /* ======================= 🔒 Private methods 🔒 ======================= */

  function getIsVerticalPlacement() {
    return includes(['top', 'bottom'], getBasicPlacement(currentPlacement))
  }

  function getIsOppositePlacement() {
    return includes(['bottom', 'right'], getBasicPlacement(currentPlacement))
  }

  function getIsInFollowCursorMode() {
    return (
      instance.props.followCursor &&
      !isUsingTouch &&
      lastTriggerEventType !== 'focus'
    )
  }

  function getTransitionableElements() {
    return [tooltip, content, instance.popperChildren.backdrop]
  }

  function removeFollowCursorListener() {
    document.removeEventListener(
      'mousemove',
      positionVirtualReferenceNearCursor,
    )
  }

  function cleanupInteractiveMouseListeners() {
    document.body.removeEventListener('mouseleave', scheduleHide)
    document.removeEventListener('mousemove', debouncedOnMouseMove)
    mouseMoveListeners = mouseMoveListeners.filter(function(listener) {
      return listener !== debouncedOnMouseMove
    })
  }

  function getEventListenersTarget() {
    return instance.props.triggerTarget || reference
  }

  function onDocumentClick(event) {
    // Clicked on interactive popper
    if (instance.props.interactive && popper.contains(event.target)) {
      return
    } // Clicked on the event listeners target

    if (getEventListenersTarget().contains(event.target)) {
      if (isUsingTouch) {
        return
      }

      if (
        instance.state.isVisible &&
        includes(instance.props.trigger, 'click')
      ) {
        return
      }
    }

    if (instance.props.hideOnClick === true) {
      instance.clearDelayTimeouts()
      instance.hide()
    }
  }

  function addDocumentClickListener() {
    document.addEventListener('click', onDocumentClick, true)
  }

  function removeDocumentClickListener() {
    document.removeEventListener('click', onDocumentClick, true)
  }

  function makeSticky() {
    setTransitionDuration([popper], isIE ? 0 : instance.props.updateDuration)

    function updatePosition() {
      instance.popperInstance.scheduleUpdate()

      if (instance.state.isMounted) {
        requestAnimationFrame(updatePosition)
      } else {
        setTransitionDuration([popper], 0)
      }
    }

    updatePosition()
  }

  function onTransitionedOut(duration, callback) {
    onTransitionEnd(duration, function() {
      if (
        !instance.state.isVisible &&
        popper.parentNode &&
        popper.parentNode.contains(popper)
      ) {
        callback()
      }
    })
  }

  function onTransitionedIn(duration, callback) {
    onTransitionEnd(duration, callback)
  }

  function onTransitionEnd(duration, callback) {
    /**
     * Listener added as the `transitionend` handler
     */
    function listener(event) {
      if (event.target === tooltip) {
        updateTransitionEndListener(tooltip, 'remove', listener)
        callback()
      }
    } // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise

    if (duration === 0) {
      return callback()
    }

    updateTransitionEndListener(tooltip, 'remove', currentTransitionEndListener)
    updateTransitionEndListener(tooltip, 'add', listener)
    currentTransitionEndListener = listener
  }

  function on(eventType, handler) {
    var options =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false
    getEventListenersTarget().addEventListener(eventType, handler, options)
    listeners.push({
      eventType: eventType,
      handler: handler,
      options: options,
    })
  }

  function addTriggersToEventListenersTarget() {
    if (instance.props.touchHold) {
      on('touchstart', onTrigger, PASSIVE)
      on('touchend', onMouseLeave, PASSIVE)
    }

    instance.props.trigger
      .trim()
      .split(' ')
      .forEach(function(eventType) {
        if (eventType === 'manual') {
          return
        }

        on(eventType, onTrigger)

        switch (eventType) {
          case 'mouseenter':
            on('mouseleave', onMouseLeave)
            break

          case 'focus':
            on(isIE ? 'focusout' : 'blur', onBlur)
            break
        }
      })
  }

  function removeTriggersFromEventListenersTarget() {
    listeners.forEach(function(_ref) {
      var eventType = _ref.eventType,
        handler = _ref.handler,
        options = _ref.options
      getEventListenersTarget().removeEventListener(eventType, handler, options)
    })
    listeners = []
  }

  function getCorrectedPadding(placement) {
    return instance.props.arrow
      ? currentComputedPadding[placement] +
          (instance.props.arrowType === 'round' ? 18 : 16)
      : currentComputedPadding[placement]
  }

  function positionVirtualReferenceNearCursor(event) {
    var _lastMouseMoveEvent = (lastMouseMoveEvent = event),
      clientX = _lastMouseMoveEvent.clientX,
      clientY = _lastMouseMoveEvent.clientY // Gets set once popperInstance `onCreate` has been called

    if (!currentComputedPadding) {
      return
    }

    var rect = reference.getBoundingClientRect()
    var followCursor = instance.props.followCursor
    var isHorizontal = followCursor === 'horizontal'
    var isVertical = followCursor === 'vertical' // Ensure virtual reference is padded to prevent tooltip from overflowing.
    // Seems to be a Popper.js issue

    var padding = _extends({}, currentComputedPadding)

    var isVerticalPlacement = getIsVerticalPlacement()

    if (isVerticalPlacement) {
      padding.left = getCorrectedPadding('left')
      padding.right = getCorrectedPadding('right')
    } else {
      padding.top = getCorrectedPadding('top')
      padding.bottom = getCorrectedPadding('bottom')
    } // TODO: Remove the following later if Popper.js changes/fixes the
    // behavior
    // Top / left boundary

    var x = isVerticalPlacement ? Math.max(padding.left, clientX) : clientX
    var y = !isVerticalPlacement ? Math.max(padding.top, clientY) : clientY // Bottom / right boundary

    if (isVerticalPlacement && x > padding.right) {
      x = Math.min(clientX, window.innerWidth - padding.right)
    }

    if (!isVerticalPlacement && y > padding.bottom) {
      y = Math.min(clientY, window.innerHeight - padding.bottom)
    } // If the instance is interactive, avoid updating the position unless it's
    // over the reference element

    var isCursorOverReference = closestCallback(event.target, function(el) {
      return el === reference
    })

    if (isCursorOverReference || !instance.props.interactive) {
      instance.popperInstance.reference.getBoundingClientRect = function() {
        return {
          width: 0,
          height: 0,
          top: isHorizontal ? rect.top : y,
          bottom: isHorizontal ? rect.bottom : y,
          left: isVertical ? rect.left : x,
          right: isVertical ? rect.right : x,
        }
      }

      instance.popperInstance.scheduleUpdate()
    }

    if (followCursor === 'initial' && instance.state.isVisible) {
      removeFollowCursorListener()
    }
  }

  function onTrigger(event) {
    if (!instance.state.isEnabled || isEventListenerStopped(event)) {
      return
    }

    if (!instance.state.isVisible) {
      lastTriggerEventType = event.type

      if (event instanceof MouseEvent) {
        lastMouseMoveEvent = event // If scrolling, `mouseenter` events can be fired if the cursor lands
        // over a new target, but `mousemove` events don't get fired. This
        // causes interactive tooltips to get stuck open until the cursor is
        // moved

        mouseMoveListeners.forEach(function(listener) {
          return listener(event)
        })
      }
    } // Toggle show/hide when clicking click-triggered tooltips

    if (
      event.type === 'click' &&
      instance.props.hideOnClick !== false &&
      instance.state.isVisible
    ) {
      scheduleHide(event)
    } else {
      scheduleShow(event)
    }
  }

  function onMouseMove(event) {
    var isCursorOverReferenceOrPopper = closestCallback(event.target, function(
      el,
    ) {
      return el === reference || el === popper
    })

    if (isCursorOverReferenceOrPopper) {
      return
    }

    if (
      isCursorOutsideInteractiveBorder(
        getBasicPlacement(currentPlacement),
        popper.getBoundingClientRect(),
        event,
        instance.props,
      )
    ) {
      cleanupInteractiveMouseListeners()
      scheduleHide(event)
    }
  }

  function onMouseLeave(event) {
    if (isEventListenerStopped(event)) {
      return
    }

    if (instance.props.interactive) {
      document.body.addEventListener('mouseleave', scheduleHide)
      document.addEventListener('mousemove', debouncedOnMouseMove)
      mouseMoveListeners.push(debouncedOnMouseMove)
      return
    }

    scheduleHide(event)
  }

  function onBlur(event) {
    if (event.target !== getEventListenersTarget()) {
      return
    }

    if (
      instance.props.interactive &&
      event.relatedTarget &&
      popper.contains(event.relatedTarget)
    ) {
      return
    }

    scheduleHide(event)
  }

  function isEventListenerStopped(event) {
    var supportsTouch = 'ontouchstart' in window
    var isTouchEvent = includes(event.type, 'touch')
    var touchHold = instance.props.touchHold
    return (
      (supportsTouch && isUsingTouch && touchHold && !isTouchEvent) ||
      (isUsingTouch && !touchHold && isTouchEvent)
    )
  }

  function createPopperInstance() {
    var popperOptions = instance.props.popperOptions
    var arrow = instance.popperChildren.arrow
    var preventOverflowModifier = getModifier(popperOptions, 'preventOverflow')

    function applyMutations(data) {
      var previousPlacement = currentPlacement
      currentPlacement = data.placement

      if (instance.props.flip && !instance.props.flipOnUpdate) {
        if (data.flipped) {
          instance.popperInstance.options.placement = data.placement
        }

        setFlipModifierEnabled(instance.popperInstance.modifiers, false)
      } // Apply Popper's `x-*` attributes to the tooltip with `data-*`

      popper.removeAttribute('x-placement')
      popper.removeAttribute('x-out-of-boundaries')
      tooltip.setAttribute('data-placement', currentPlacement)

      if (data.attributes['x-out-of-boundaries'] !== false) {
        tooltip.setAttribute('data-out-of-boundaries', '')
      } else {
        tooltip.removeAttribute('data-out-of-boundaries')
      } // Apply the `distance` prop

      var basicPlacement = getBasicPlacement(currentPlacement)
      var tooltipStyles = tooltip.style
      tooltipStyles.top = ''
      tooltipStyles.bottom = ''
      tooltipStyles.left = ''
      tooltipStyles.right = ''
      tooltipStyles[getIsVerticalPlacement() ? 'top' : 'left'] = ''.concat(
        (getIsOppositePlacement() ? 1 : -1) * instance.props.distance,
        'px',
      )
      var padding =
        preventOverflowModifier && preventOverflowModifier.padding !== undefined
          ? preventOverflowModifier.padding
          : PADDING
      var isPaddingNumber = typeof padding === 'number'

      var computedPadding = _extends(
        {
          top: isPaddingNumber ? padding : padding.top,
          bottom: isPaddingNumber ? padding : padding.bottom,
          left: isPaddingNumber ? padding : padding.left,
          right: isPaddingNumber ? padding : padding.right,
        },
        !isPaddingNumber && padding,
      )

      computedPadding[basicPlacement] = isPaddingNumber
        ? padding + instance.props.distance
        : (padding[basicPlacement] || 0) + instance.props.distance
      instance.popperInstance.modifiers.filter(function(m) {
        return m.name === 'preventOverflow'
      })[0].padding = computedPadding
      currentComputedPadding = computedPadding // The `distance` offset needs to be re-considered by Popper.js if the
      // placement changed

      if (currentPlacement !== previousPlacement) {
        instance.popperInstance.update()
      }
    }

    var config = _extends(
      {
        eventsEnabled: false,
        placement: instance.props.placement,
      },
      popperOptions,
      {
        modifiers: _extends({}, popperOptions ? popperOptions.modifiers : {}, {
          preventOverflow: _extends(
            {
              boundariesElement: instance.props.boundary,
              padding: PADDING,
            },
            preventOverflowModifier,
          ),
          arrow: _extends(
            {
              element: arrow,
              enabled: !!arrow,
            },
            getModifier(popperOptions, 'arrow'),
          ),
          flip: _extends(
            {
              enabled: instance.props.flip,
              // The tooltip is offset by 10px from the popper in CSS,
              // we need to account for its distance
              padding: instance.props.distance + PADDING,
              behavior: instance.props.flipBehavior,
            },
            getModifier(popperOptions, 'flip'),
          ),
          offset: _extends(
            {
              offset: instance.props.offset,
            },
            getModifier(popperOptions, 'offset'),
          ),
        }),
        onCreate: function onCreate(data) {
          applyMutations(data)
          runMountCallback()

          if (popperOptions && popperOptions.onCreate) {
            popperOptions.onCreate(data)
          }
        },
        onUpdate: function onUpdate(data) {
          applyMutations(data)
          runMountCallback()

          if (popperOptions && popperOptions.onUpdate) {
            popperOptions.onUpdate(data)
          }
        },
      },
    )

    instance.popperInstance = new Popper(reference, popper, config)
  }

  function runMountCallback() {
    if (!hasMountCallbackRun && currentMountCallback) {
      hasMountCallbackRun = true
      reflow(popper)
      currentMountCallback()
    }
  }

  function mount() {
    hasMountCallbackRun = false
    var isInFollowCursorMode = getIsInFollowCursorMode()
    var shouldEnableListeners =
      !isInFollowCursorMode &&
      !(instance.props.followCursor === 'initial' && isUsingTouch)

    if (!instance.popperInstance) {
      createPopperInstance()

      if (shouldEnableListeners) {
        instance.popperInstance.enableEventListeners()
      }
    } else {
      if (!isInFollowCursorMode) {
        instance.popperInstance.scheduleUpdate()

        if (shouldEnableListeners) {
          instance.popperInstance.enableEventListeners()
        }
      }

      setFlipModifierEnabled(
        instance.popperInstance.modifiers,
        instance.props.flip,
      )
    } // If the instance previously had followCursor behavior, it will be
    // positioned incorrectly if triggered by `focus` afterwards.
    // Update the reference back to the real DOM element

    instance.popperInstance.reference = reference
    var arrow = instance.popperChildren.arrow

    if (isInFollowCursorMode) {
      if (arrow) {
        arrow.style.margin = '0'
      }

      if (lastMouseMoveEvent) {
        positionVirtualReferenceNearCursor(lastMouseMoveEvent)
      }
    } else if (arrow) {
      arrow.style.margin = ''
    } // Allow followCursor: 'initial' on touch devices

    if (
      isUsingTouch &&
      lastMouseMoveEvent &&
      instance.props.followCursor === 'initial'
    ) {
      positionVirtualReferenceNearCursor(lastMouseMoveEvent)

      if (arrow) {
        arrow.style.margin = '0'
      }
    }

    var appendTo = instance.props.appendTo
    var parentNode =
      appendTo === 'parent'
        ? reference.parentNode
        : invokeWithArgsOrReturn(appendTo, [reference])

    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper)
      instance.props.onMount(instance)
      instance.state.isMounted = true
    }
  }

  function scheduleShow(event) {
    instance.clearDelayTimeouts()

    if (event) {
      instance.props.onTrigger(instance, event)
    }

    if (instance.state.isVisible) {
      return
    }

    isScheduledToShow = true

    if (instance.props.wait) {
      return instance.props.wait(instance, event)
    } // If the tooltip has a delay, we need to be listening to the mousemove as
    // soon as the trigger event is fired, so that it's in the correct position
    // upon mount.
    // Edge case: if the tooltip is still mounted, but then scheduleShow() is
    // called, it causes a jump.

    if (getIsInFollowCursorMode() && !instance.state.isMounted) {
      if (!instance.popperInstance) {
        createPopperInstance()
      }

      document.addEventListener('mousemove', positionVirtualReferenceNearCursor)
    }

    addDocumentClickListener()
    var delay = getValue(instance.props.delay, 0, defaultProps.delay)

    if (delay) {
      showTimeout = setTimeout(function() {
        instance.show()
      }, delay)
    } else {
      instance.show()
    }
  }

  function scheduleHide(event) {
    instance.clearDelayTimeouts()
    instance.props.onUntrigger(instance, event)

    if (!instance.state.isVisible) {
      return removeFollowCursorListener()
    }

    isScheduledToShow = false
    var delay = getValue(instance.props.delay, 1, defaultProps.delay)

    if (delay) {
      hideTimeout = setTimeout(function() {
        if (instance.state.isVisible) {
          instance.hide()
        }
      }, delay)
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      animationFrame = requestAnimationFrame(function() {
        instance.hide()
      })
    }
  }
  /* ======================= 🔑 Public methods 🔑 ======================= */

  function enable() {
    instance.state.isEnabled = true
  }

  function disable() {
    instance.state.isEnabled = false
  }

  function clearDelayTimeouts() {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
    cancelAnimationFrame(animationFrame)
  }

  function setProps(partialProps) {
    if (process.env.NODE_ENV !== 'production') {
      warnWhen(
        instance.state.isDestroyed,
        '`set()` was called on a destroyed instance. ' +
          'This is a no-op but indicates a potential memory leak.',
      )
    }

    if (instance.state.isDestroyed) {
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      validateProps(partialProps)
    }

    removeTriggersFromEventListenersTarget()
    var prevProps = instance.props
    var nextProps = evaluateProps(
      reference,
      _extends({}, instance.props, partialProps, {
        ignoreAttributes: true,
      }),
    )
    nextProps.ignoreAttributes = hasOwnProperty(
      partialProps,
      'ignoreAttributes',
    )
      ? partialProps.ignoreAttributes || false
      : prevProps.ignoreAttributes
    instance.props = nextProps
    addTriggersToEventListenersTarget()
    cleanupInteractiveMouseListeners()
    debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce)

    content.style.transitionDelay = '0s'
    tooltip.style.transitionProperty = 'opacity, background, transform'

    updatePopperElement(popper, prevProps, nextProps, instance.state.isVisible)
    instance.popperChildren = getChildren(popper)

    requestAnimationFrame(() => {
      tooltip.style.transitionProperty = ''
    })

    if (instance.popperInstance) {
      if (
        POPPER_INSTANCE_DEPENDENCIES.some(function(prop) {
          return (
            hasOwnProperty(partialProps, prop) &&
            partialProps[prop] !== prevProps[prop]
          )
        })
      ) {
        instance.popperInstance.destroy()
        createPopperInstance()

        if (instance.state.isVisible) {
          instance.popperInstance.enableEventListeners()
        }

        if (instance.props.followCursor && lastMouseMoveEvent) {
          positionVirtualReferenceNearCursor(lastMouseMoveEvent)
        }
      } else {
        instance.popperInstance.update()
      }
    }
  }

  function setContent(content) {
    instance.setProps({
      content: content,
    })
  }

  function show() {
    var duration =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : getValue(instance.props.duration, 0, defaultProps.duration[1])
    var shouldPreventPopperTransition =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true

    if (process.env.NODE_ENV !== 'production') {
      warnWhen(
        instance.state.isDestroyed,
        '`show()` was called on a destroyed instance. ' +
          'This is a no-op but indicates a potential memory leak.',
      )
    } // Early bail-out

    var isAlreadyVisible = instance.state.isVisible
    var isDestroyed = instance.state.isDestroyed
    var isDisabled = !instance.state.isEnabled
    var isUsingTouchAndTouchDisabled = isUsingTouch && !instance.props.touch

    if (
      isAlreadyVisible ||
      isDestroyed ||
      isDisabled ||
      isUsingTouchAndTouchDisabled
    ) {
      return
    } // Standardize `disabled` behavior across browsers.
    // Firefox allows events on disabled elements, but Chrome doesn't.
    // Using a wrapper element (i.e. <span>) is recommended.

    if (getEventListenersTarget().hasAttribute('disabled')) {
      return
    }

    if (instance.props.onShow(instance) === false) {
      return
    }

    addDocumentClickListener()
    popper.style.visibility = 'visible'
    instance.state.isVisible = true // Prevent a transition of the popper from its previous position and of the
    // elements at a different placement.

    var transitionableElements = getTransitionableElements()
    setTransitionDuration(
      shouldPreventPopperTransition
        ? transitionableElements.concat(popper)
        : transitionableElements,
      0,
    )

    currentMountCallback = function currentMountCallback() {
      if (!instance.state.isVisible) {
        return
      } // Double update will apply correct mutations

      if (!getIsInFollowCursorMode()) {
        instance.popperInstance.update()
      }

      if (instance.popperChildren.backdrop) {
        instance.popperChildren.content.style.transitionDelay =
          Math.round(duration / 12) + 'ms'
      }

      if (instance.props.sticky) {
        makeSticky()
      }

      setTransitionDuration([popper], instance.props.updateDuration)
      setTransitionDuration(transitionableElements, duration)
      setVisibilityState(transitionableElements, 'visible')
      onTransitionedIn(duration, function() {
        if (instance.props.aria) {
          getEventListenersTarget().setAttribute(
            'aria-'.concat(instance.props.aria),
            tooltip.id,
          )
        }

        instance.props.onShown(instance)
        instance.state.isShown = true
      })
    }

    mount()
  }

  function hide() {
    var duration =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : getValue(instance.props.duration, 1, defaultProps.duration[1])

    if (process.env.NODE_ENV !== 'production') {
      warnWhen(
        instance.state.isDestroyed,
        '`hide()` was called on a destroyed instance. ' +
          'This is a no-op but indicates a potential memory leak.',
      )
    } // Early bail-out
    // We're checking `isMounted` instead if `isVisible` so that `destroy()`'s
    // instance.hide(0) call is not ignored (to unmount the tippy instantly)

    var isAlreadyHidden = !instance.state.isMounted
    var isDestroyed = instance.state.isDestroyed
    var isDisabled = !instance.state.isEnabled

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return
    }

    if (instance.props.onHide(instance) === false) {
      return
    }

    removeDocumentClickListener()
    popper.style.visibility = 'hidden'
    instance.state.isVisible = false
    instance.state.isShown = false
    var transitionableElements = getTransitionableElements()
    setTransitionDuration(transitionableElements, duration)
    setVisibilityState(transitionableElements, 'hidden')
    onTransitionedOut(duration, function() {
      if (!isScheduledToShow) {
        removeFollowCursorListener()
      }

      if (instance.props.aria) {
        getEventListenersTarget().removeAttribute(
          'aria-'.concat(instance.props.aria),
        )
      }

      instance.popperInstance.disableEventListeners()
      instance.popperInstance.options.placement = instance.props.placement
      popper.parentNode.removeChild(popper)
      instance.props.onHidden(instance)
      instance.state.isMounted = false
    })
  }

  function destroy() {
    if (process.env.NODE_ENV !== 'production') {
      warnWhen(
        instance.state.isDestroyed,
        '`destroy()` was called on an already-destroyed ' +
          'instance. This is a no-op but indicates a potential memory leak.',
      )
    }

    if (instance.state.isDestroyed) {
      return
    }

    instance.hide(0)

    removeTriggersFromEventListenersTarget()
    delete reference._tippy

    if (instance.popperInstance) {
      instance.popperInstance.destroy()
    }

    instance.state.isDestroyed = true
  }
}

var globalEventListenersBound = false
/**
 * Exported module
 */

function tippy(targets, optionalProps) {
  if (process.env.NODE_ENV !== 'production') {
    validateTargets(targets)
    validateProps(optionalProps)
  }

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  var props = _extends({}, defaultProps, optionalProps)

  var elements = getArrayOfElements(targets)

  if (process.env.NODE_ENV !== 'production') {
    var isSingleContentElement = isRealElement(props.content)
    var isMoreThanOneReferenceElement = elements.length > 1
    warnWhen(
      isSingleContentElement && isMoreThanOneReferenceElement,
      '`tippy()` was passed a targets argument that will create more than ' +
        'one tippy instance, but only a single element was supplied as the ' +
        '`content` option. Use a function that returns a cloned version of ' +
        'the element instead, or pass the .innerHTML of the template element.',
    )
  }

  var instances = elements.reduce(function(acc, reference) {
    var instance = reference && createTippy(reference, props)

    if (instance) {
      acc.push(instance)
    }

    return acc
  }, [])
  return targets ? (isRealElement(targets) ? instances[0] : instances) : null
}

tippy.version = version
tippy.defaultProps = defaultProps
/**
 * Mutates the defaultProps object by setting the props specified
 */

tippy.setDefaultProps = function(partialProps) {
  Object.keys(partialProps).forEach(function(key) {
    // @ts-ignore
    defaultProps[key] = partialProps[key]
  })
}
/**
 * Hides all visible poppers on the document
 */

tippy.hideAll = function() {
  var _ref =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    excludedReferenceOrInstance = _ref.exclude,
    duration = _ref.duration

  arrayFrom(document.querySelectorAll(POPPER_SELECTOR)).forEach(function(
    popper,
  ) {
    var instance = popper._tippy

    if (instance) {
      var isExcluded = false

      if (excludedReferenceOrInstance) {
        isExcluded = isReferenceElement(excludedReferenceOrInstance)
          ? instance.reference === excludedReferenceOrInstance
          : popper === excludedReferenceOrInstance.popper
      }

      if (!isExcluded) {
        instance.hide(duration)
      }
    }
  })
}

if (process.env.NODE_ENV !== 'production') {
  tippy.group = function() {
    warnWhen(
      true,
      '`tippy.group()` was removed in v5 and replaced with ' +
        '`createSingleton()`. Read more here: ' +
        'https://atomiks.github.io/tippyjs/addons#singleton',
    )
  }

  tippy.setDefaults = function() {
    warnWhen(
      true,
      '`tippy.setDefaults()` was renamed to `tippy.setDefaultProps()` in v5.',
    )
  }

  Object.defineProperty(tippy, 'defaults', {
    get: function get() {
      warnWhen(
        true,
        'The `tippy.defaults` property was renamed to `tippy.defaultProps` ' +
          'in v5.',
      )
      return undefined
    },
  })
}
/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */

function autoInit() {
  arrayFrom(document.querySelectorAll('[data-tippy]')).forEach(function(el) {
    var content = el.getAttribute('data-tippy')

    if (content) {
      tippy(el, {
        content: content,
      })
    }
  })
}

if (isBrowser) {
  setTimeout(autoInit)
}

export { tippy as a, isBrowser as b, _extends as c, getValue as d }
//# sourceMappingURL=tippy.chunk.js.map
