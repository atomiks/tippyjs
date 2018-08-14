/*!
* Tippy.js v3.0.0-alpha.2
* (c) 2017-2018 atomiks
* MIT
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('popper.js')) :
	typeof define === 'function' && define.amd ? define(['popper.js'], factory) :
	(global.tippy = factory(global.Popper));
}(this, (function (Popper) { 'use strict';

Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

var version = "3.0.0-alpha.2";

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var Defaults = {
  a11y: true,
  content: '',
  placement: 'top',
  livePlacement: true,
  trigger: 'mouseenter focus',
  hideOnClick: true,
  animation: 'shift-away',
  animateFill: true,
  arrow: false,
  delay: 0,
  duration: [325, 275],
  interactive: false,
  interactiveBorder: 2,
  theme: 'dark',
  size: 'regular',
  distance: 10,
  offset: 0,
  multiple: false,
  followCursor: false,
  inertia: false,
  updateDuration: 200,
  sticky: false,
  appendTo: function appendTo() {
    return document.body;
  },
  zIndex: 9999,
  touchHold: false,
  performance: false,
  flip: true,
  flipBehavior: 'flip',
  arrowType: 'sharp',
  arrowTransform: '',
  target: '',
  allowHTML: true,
  showOnInit: false,
  popperOptions: {},
  lazy: true,
  touch: true,
  onShow: function onShow() {},
  onShown: function onShown() {},
  onHide: function onHide() {},
  onHidden: function onHidden() {}
};

var setDefaults = function setDefaults(partialDefaults) {
  Defaults = _extends({}, Defaults, partialDefaults);
};

var Selectors = {
  POPPER: '.tippy-popper',
  TOOLTIP: '.tippy-tooltip',
  CONTENT: '.tippy-content',
  BACKDROP: '.tippy-backdrop',
  ARROW: '.tippy-arrow',
  ROUND_ARROW: '.tippy-roundarrow'
};

/**
 * Firefox extensions doesn't allow 'innerHTML' to be set but we can trick it
 * + aid for minifiers not to remove the trick
 */
var FF_EXTENSION_TRICK = { x: true

  /**
   * Determines if the runtime is a browser
   */
};var isBrowser = typeof window !== 'undefined';

/**
 * Determines if the browser is supported
 */


/**
 * Injects a string of CSS styles to the style node in the document head
 */


/**
 * Ponyfill for Array.from; converts iterable values to an array
 */
var toArray$1 = function toArray$$1(value) {
  return [].slice.call(value);
};

/**
 * Sets the content of a tooltip
 */
var setContent = function setContent(contentEl, props) {
  if (props.content instanceof Element) {
    setInnerHTML(contentEl, '');
    contentEl.appendChild(props.content);
  } else {
    contentEl[props.allowHTML ? 'innerHTML' : 'textContent'] = props.content;
  }
};

/**
 * Determines if an element can receive focus
 */
var elementCanReceiveFocus = function elementCanReceiveFocus(el) {
  return el instanceof Element ? matches.call(el, 'a[href],area[href],button,details,input,textarea,select,iframe,[tabindex]') && !el.hasAttribute('disabled') : true;
};

/**
 * Applies a transition duration to a list of elements
 */
var applyTransitionDuration = function applyTransitionDuration(els, value) {
  els.filter(Boolean).forEach(function (el) {
    el.style.transitionDuration = value + 'ms';
  });
};

/**
 * Returns the child elements of a popper element
 */
var getChildren = function getChildren(popper) {
  var select = function select(s) {
    return popper.querySelector(s);
  };
  return {
    tooltip: select(Selectors.TOOLTIP),
    backdrop: select(Selectors.BACKDROP),
    content: select(Selectors.CONTENT),
    arrow: select(Selectors.ARROW) || select(Selectors.ROUND_ARROW)
  };
};

/**
 * Determines if a value is a plain object
 */
var isPlainObject = function isPlainObject(value) {
  return {}.toString.call(value) === '[object Object]';
};

/**
 * Creates and returns a div element
 */
var div = function div() {
  return document.createElement('div');
};

/**
 * Sets the innerHTML of an element while tricking linters & minifiers
 */
var setInnerHTML = function setInnerHTML(el, html) {
  el[FF_EXTENSION_TRICK.x && 'innerHTML'] = html instanceof Element ? html[FF_EXTENSION_TRICK.x && 'innerHTML'] : html;
};

/**
 * Returns an array of elements based on the value
 */
var getArrayOfElements = function getArrayOfElements(value) {
  if (value instanceof Element || isPlainObject(value)) {
    return [value];
  }
  if (value instanceof NodeList) {
    return toArray$1(value);
  }
  if (Array.isArray(value)) {
    return value;
  }

  try {
    return toArray$1(document.querySelectorAll(value));
  } catch (e) {
    return [];
  }
};

/**
 * Determines if a value is numeric
 */
var isNumeric = function isNumeric(value) {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Returns a value at a given index depending on if it's an array or number
 */
var getValue = function getValue(value, index, defaultValue) {
  if (Array.isArray(value)) {
    var v = value[index];
    return v == null ? defaultValue : v;
  }
  return value;
};

/**
 * Creates an arrow element and returns it
 */
var createArrowElement = function createArrowElement(arrowType) {
  var arrow = div();
  if (arrowType === 'round') {
    arrow.className = 'tippy-roundarrow';
    setInnerHTML(arrow, '<svg viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg"><path d="M3 8s2.021-.015 5.253-4.218C9.584 2.051 10.797 1.007 12 1c1.203-.007 2.416 1.035 3.761 2.782C19.012 8.005 21 8 21 8H3z"/></svg>');
  } else {
    arrow.className = 'tippy-arrow';
  }
  return arrow;
};

/**
 * Creates a backdrop element and returns it
 */
var createBackdropElement = function createBackdropElement() {
  var backdrop = div();
  backdrop.className = 'tippy-backdrop';
  backdrop.setAttribute('data-state', 'hidden');
  return backdrop;
};

/**
 * Adds interactive attributes
 */
var addInteractive = function addInteractive(popper, tooltip) {
  popper.setAttribute('tabindex', '-1');
  tooltip.setAttribute('data-interactive', '');
};

/**
 * Removes interactive attributes
 */
var removeInteractive = function removeInteractive(popper, tooltip) {
  popper.removeAttribute('tabindex');
  tooltip.removeAttribute('data-interactive');
};

/**
 * Adds inertia attribute
 */
var addInertia = function addInertia(tooltip) {
  tooltip.setAttribute('data-inertia', '');
};

/**
 * Removes inertia attribute
 */
var removeInertia = function removeInertia(tooltip) {
  tooltip.removeAttribute('data-inertia');
};

/**
 * Constructs the popper element and returns it
 */
var createPopperElement = function createPopperElement(id, props) {
  var popper = div();
  popper.className = 'tippy-popper';
  popper.role = 'tooltip';
  popper.id = 'tippy-' + id;
  popper.style.zIndex = props.zIndex;

  var tooltip = div();
  tooltip.className = 'tippy-tooltip';
  tooltip.setAttribute('data-size', props.size);
  tooltip.setAttribute('data-animation', props.animation);
  tooltip.setAttribute('data-state', 'hidden');
  props.theme.split(' ').forEach(function (t) {
    tooltip.classList.add(t + '-theme');
  });

  var content = div();
  content.className = 'tippy-content';

  if (props.interactive) {
    addInteractive(popper, tooltip);
  }

  if (props.arrow) {
    tooltip.appendChild(createArrowElement(props.arrowType));
  }

  if (props.animateFill) {
    tooltip.appendChild(createBackdropElement());
    tooltip.setAttribute('data-animatefill', '');
  }

  if (props.inertia) {
    tooltip.setAttribute('data-inertia', '');
  }

  setContent(content, props);

  tooltip.appendChild(content);
  popper.appendChild(tooltip);

  popper.addEventListener('focusout', function (e) {
    if (e.relatedTarget && popper._tippy && !closestCallback(e.relatedTarget, function (el) {
      return el === popper;
    })) {
      popper._tippy.hide();
    }
  });

  return popper;
};

/**
 * Updates the popper element based on the new props
 */
var updatePopperElement = function updatePopperElement(popper, prevProps, nextProps) {
  var _getChildren = getChildren(popper),
      tooltip = _getChildren.tooltip,
      content = _getChildren.content,
      backdrop = _getChildren.backdrop,
      arrow = _getChildren.arrow;

  // Ensure the tooltip doesn't transition


  var currTransitionDuration = parseFloat(tooltip.style.transitionDuration);
  applyTransitionDuration([tooltip], 0);

  popper.style.zIndex = nextProps.zIndex;
  tooltip.setAttribute('data-size', nextProps.size);
  tooltip.setAttribute('data-animation', nextProps.animation);
  setContent(content, nextProps);

  // animateFill
  if (!prevProps.animateFill && nextProps.animateFill) {
    tooltip.appendChild(createBackdropElement());
    tooltip.setAttribute('data-animatefill', '');
  } else if (prevProps.animateFill && !nextProps.animateFill) {
    tooltip.removeChild(backdrop);
    tooltip.removeAttribute('data-animatefill');
  }

  // arrow
  if (!prevProps.arrow && nextProps.arrow) {
    tooltip.appendChild(createArrowElement(nextProps.arrowType));
  } else if (prevProps.arrow && !nextProps.arrow) {
    tooltip.removeChild(arrow);
  }

  // arrowType
  if (prevProps.arrow && nextProps.arrow && prevProps.arrowType !== nextProps.arrowType) {
    tooltip.replaceChild(createArrowElement(nextProps.arrowType), arrow);
  }

  // interactive
  if (!prevProps.interactive && nextProps.interactive) {
    addInteractive(popper, tooltip);
  } else if (prevProps.interactive && !nextProps.interactive) {
    removeInteractive(popper, tooltip);
  }

  // inertia
  if (!prevProps.inertia && nextProps.inertia) {
    addInertia(tooltip);
  } else if (prevProps.inertia && !nextProps.inertia) {
    removeInertia(tooltip);
  }

  // theme
  if (prevProps.theme !== nextProps.theme) {
    prevProps.theme.split(' ').forEach(function (theme) {
      tooltip.classList.remove(theme + '-theme');
    });
    nextProps.theme.split(' ').forEach(function (theme) {
      tooltip.classList.add(theme + '-theme');
    });
  }

  defer(function () {
    applyTransitionDuration([tooltip], currTransitionDuration);
  });
};

/**
 * Hides all visible poppers on the document
 */
var hideAllPoppers = function hideAllPoppers(excludeTippy) {
  toArray$1(document.querySelectorAll(Selectors.POPPER)).forEach(function (popper) {
    var tip = popper._tippy;
    if (tip && tip.props.hideOnClick === true && (!excludeTippy || popper !== excludeTippy.popper)) {
      tip.hide();
    }
  });
};

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
var getDataAttributeOptions = function getDataAttributeOptions(reference) {
  return Object.keys(Defaults).reduce(function (acc, key) {
    var valueAsString = (reference.getAttribute('data-tippy-' + key) || '').trim();

    if (!valueAsString) {
      return acc;
    }

    if (valueAsString === 'true') {
      acc[key] = true;
    } else if (valueAsString === 'false') {
      acc[key] = false;
    } else if (isNumeric(valueAsString)) {
      acc[key] = Number(valueAsString);
    } else if (key !== 'target' && valueAsString[0] === '[') {
      acc[key] = JSON.parse(valueAsString);
    } else {
      acc[key] = valueAsString;
    }

    return acc;
  }, {});
};

/**
 * Polyfills the virtual reference (plain object) with needed props
 * Mutating because DOM elements are mutated, adds _tippy property
 */
var polyfillVirtualReferenceProps = function polyfillVirtualReferenceProps(virtualReference) {
  var polyfills = {
    isVirtual: true,
    attributes: virtualReference.attributes || {},
    setAttribute: function setAttribute(key, value) {
      virtualReference.attributes[key] = value;
    },
    getAttribute: function getAttribute(key) {
      return virtualReference.attributes[key];
    },
    removeAttribute: function removeAttribute(key) {
      delete virtualReference.attributes[key];
    },
    hasAttribute: function hasAttribute(key) {
      return key in virtualReference.attributes;
    },
    addEventListener: function addEventListener() {},
    removeEventListener: function removeEventListener() {},

    classList: {
      classNames: {},
      add: function add(key) {
        virtualReference.classList.classNames[key] = true;
      },
      remove: function remove(key) {
        delete virtualReference.classList.classNames[key];
      },
      contains: function contains(key) {
        return key in virtualReference.classList.classNames;
      }
    }
  };

  for (var key in polyfills) {
    virtualReference[key] = polyfills[key];
  }

  return virtualReference;
};

/**
 * Ponyfill for Element.prototype.matches
 */
var matches = function () {
  if (isBrowser) {
    var e = Element.prototype;
    return e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector;
  }
}();

/**
 * Ponyfill for Element.prototype.closest
 */
var closest = function closest(element, parentSelector) {
  return (Element.prototype.closest || function (selector) {
    var el = this;
    while (el) {
      if (matches.call(el, selector)) return el;
      el = el.parentElement;
    }
  }).call(element, parentSelector);
};

/**
 * Works like Element.prototype.closest, but uses a callback instead
 */
var closestCallback = function closestCallback(element, callback) {
  while (element) {
    if (callback(element)) return element;
    element = element.parentElement;
  }
};

/**
 * Focuses an element while preventing a scroll jump if it's not within the viewport
 */
var focus = function focus(el) {
  var x = window.scrollX || window.pageXOffset;
  var y = window.scrollY || window.pageYOffset;
  el.focus();
  scroll(x, y);
};

/**
 * Triggers reflow
 */
var reflow = function reflow(popper) {
  void popper.offsetHeight;
};

/**
 * Transforms the x/y axis ased on the placement
 */
var transformAxisBasedOnPlacement = function transformAxisBasedOnPlacement(axis, isVertical) {
  return (isVertical ? axis : {
    X: 'Y',
    Y: 'X'
  }[axis]) || '';
};

/**
 * Transforms the scale/translate numbers based on the placement
 */
var transformNumbersBasedOnPlacement = function transformNumbersBasedOnPlacement(type, numbers, isVertical, isReverse) {
  /**
   * Avoid destructuring because a large boilerplate function is generated
   * by Babel
   */
  var a = numbers[0];
  var b = numbers[1];

  if (!a && !b) {
    return '';
  }

  var transforms = {
    scale: function () {
      if (!b) {
        return '' + a;
      } else {
        return isVertical ? a + ', ' + b : b + ', ' + a;
      }
    }(),
    translate: function () {
      if (!b) {
        return isReverse ? -a + 'px' : a + 'px';
      } else {
        if (isVertical) {
          return isReverse ? a + 'px, ' + -b + 'px' : a + 'px, ' + b + 'px';
        } else {
          return isReverse ? -b + 'px, ' + a + 'px' : b + 'px, ' + a + 'px';
        }
      }
    }()
  };

  return transforms[type];
};

/**
 * Returns the axis for a CSS function (translate or scale)
 */
var getTransformAxis = function getTransformAxis(str, cssFunction) {
  var match = str.match(new RegExp(cssFunction + '([XY])'));
  return match ? match[1] : '';
};

/**
 * Returns the numbers given to the CSS function
 */
var getTransformNumbers = function getTransformNumbers(str, regex) {
  var match = str.match(regex);
  return match ? match[1].split(',').map(parseFloat) : [];
};

var TRANSFORM_NUMBER_RE = {
  translate: /translateX?Y?\(([^)]+)\)/,
  scale: /scaleX?Y?\(([^)]+)\)/

  /**
   * Computes the arrow's transform so that it is correct for any placement
   */
};var computeArrowTransform = function computeArrowTransform(arrow, arrowTransform) {
  var placement = getPopperPlacement(closest(arrow, Selectors.POPPER));
  var isVertical = placement === 'top' || placement === 'bottom';
  var isReverse = placement === 'right' || placement === 'bottom';

  var matches = {
    translate: {
      axis: getTransformAxis(arrowTransform, 'translate'),
      numbers: getTransformNumbers(arrowTransform, TRANSFORM_NUMBER_RE.translate)
    },
    scale: {
      axis: getTransformAxis(arrowTransform, 'scale'),
      numbers: getTransformNumbers(arrowTransform, TRANSFORM_NUMBER_RE.scale)
    }
  };

  var computedTransform = arrowTransform.replace(TRANSFORM_NUMBER_RE.translate, 'translate' + transformAxisBasedOnPlacement(matches.translate.axis, isVertical) + '(' + transformNumbersBasedOnPlacement('translate', matches.translate.numbers, isVertical, isReverse) + ')').replace(TRANSFORM_NUMBER_RE.scale, 'scale' + transformAxisBasedOnPlacement(matches.scale.axis, isVertical) + '(' + transformNumbersBasedOnPlacement('scale', matches.scale.numbers, isVertical, isReverse) + ')');

  arrow.style[prefix('transform')] = computedTransform;
};

/**
 * Sets the visibility state of a popper so it can begin to transition in or out
 */
var setVisibilityState = function setVisibilityState(els, type) {
  els.filter(Boolean).forEach(function (el) {
    el.setAttribute('data-state', type);
  });
};

/**
 * Prefixes a CSS property with the one supported by the browser
 */
var prefix = function prefix(property) {
  var prefixes = ['', 'webkit'];
  var upperProp = property[0].toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var _prefix = prefixes[i];
    var prefixedProp = _prefix ? _prefix + upperProp : property;
    if (typeof document.body.style[prefixedProp] !== 'undefined') {
      return prefixedProp;
    }
  }

  return null;
};

/**
 * Update's a popper's position and runs a callback onUpdate; wrapper for async updates
 */
var updatePopperPosition = function updatePopperPosition(popperInstance, callback, updateAlreadyCalled) {
  var popper = popperInstance.popper,
      options = popperInstance.options;

  var onCreate = options.onCreate;
  var onUpdate = options.onUpdate;

  options.onCreate = options.onUpdate = function () {
    reflow(popper);
    callback && callback();
    onUpdate();
    options.onCreate = onCreate;
    options.onUpdate = onUpdate;
  };

  if (!updateAlreadyCalled) {
    popperInstance.scheduleUpdate();
  }
};

/**
 * Defers a function's execution until the call stack has cleared
 */
var defer = function defer(fn) {
  setTimeout(fn, 1);
};

/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 */
var isCursorOutsideInteractiveBorder = function isCursorOutsideInteractiveBorder(popperPlacement, popperRect, event, props) {
  if (!popperPlacement) {
    return true;
  }

  var x = event.clientX,
      y = event.clientY;
  var interactiveBorder = props.interactiveBorder,
      distance = props.distance;


  var exceedsTop = popperRect.top - y > (popperPlacement === 'top' ? interactiveBorder + distance : interactiveBorder);

  var exceedsBottom = y - popperRect.bottom > (popperPlacement === 'bottom' ? interactiveBorder + distance : interactiveBorder);

  var exceedsLeft = popperRect.left - x > (popperPlacement === 'left' ? interactiveBorder + distance : interactiveBorder);

  var exceedsRight = x - popperRect.right > (popperPlacement === 'right' ? interactiveBorder + distance : interactiveBorder);

  return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
};

/**
 * Returns the distance offset, taking into account the default offset due to
 * the transform: translate() rule in CSS
 */
var getOffsetDistanceInPx = function getOffsetDistanceInPx(distance, defaultDistance) {
  return -(distance - defaultDistance) + 'px';
};

/**
 * Returns the popper's placement, ignoring shifting (top-start, etc)
 */
var getPopperPlacement = function getPopperPlacement(popper) {
  var fullPlacement = popper.getAttribute('x-placement');
  return fullPlacement ? fullPlacement.split('-')[0] : '';
};

/**
 * Evaluates props
 */
var evaluateProps = function evaluateProps(reference, props) {
  var out = _extends({}, props, props.performance ? {} : getDataAttributeOptions(reference));

  if (out.arrow) {
    out.animateFill = false;
  }

  if (typeof out.appendTo === 'function') {
    out.appendTo = props.appendTo(reference);
  }

  if (typeof out.content === 'function') {
    out.content = props.content(reference);
  }

  return out;
};

var toggleTransitionEndListener = function toggleTransitionEndListener(tooltip, action, listener) {
  tooltip[action + 'EventListener']('transitionend', listener);
};

var nav = isBrowser ? navigator : {};
var win = isBrowser ? window : {};
var isIE = /MSIE |Trident\//.test(nav.userAgent);
var isIOS = /iPhone|iPad|iPod/.test(nav.platform) && !win.MSStream;
var supportsTouch = 'ontouchstart' in win;
var isUsingTouch = false;

var onDocumentTouch = function onDocumentTouch() {
  if (isUsingTouch) {
    return;
  }

  isUsingTouch = true;

  if (isIOS) {
    document.body.classList.add('tippy-iOS');
  }

  if (window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove);
  }
};

var lastMouseMoveTime = 0;
var onDocumentMouseMove = function onDocumentMouseMove() {
  var now = performance.now();

  // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
  if (now - lastMouseMoveTime < 20) {
    isUsingTouch = false;
    document.removeEventListener('mousemove', onDocumentMouseMove);
    if (!isIOS) {
      document.body.classList.remove('tippy-iOS');
    }
  }

  lastMouseMoveTime = now;
};

var onDocumentClick = function onDocumentClick(_ref) {
  var target = _ref.target;

  // Simulated events dispatched on the document
  if (!(target instanceof Element)) {
    return hideAllPoppers();
  }

  // Clicked on an interactive popper
  var popper = closest(target, Selectors.POPPER);
  if (popper && popper._tippy && popper._tippy.props.interactive) {
    return;
  }

  // Clicked on a reference
  var reference = closestCallback(target, function (el) {
    return el._tippy && el._tippy.reference === el;
  });
  if (reference) {
    var tip = reference._tippy;
    var isClickTrigger = tip.props.trigger.indexOf('click') > -1;

    if (isUsingTouch || isClickTrigger) {
      return hideAllPoppers(tip);
    }

    if (tip.props.hideOnClick !== true || isClickTrigger) {
      return;
    }

    tip.clearDelayTimeouts();
  }

  hideAllPoppers();
};

var onWindowBlur = function onWindowBlur() {
  var _document = document,
      activeElement = _document.activeElement;

  if (activeElement && activeElement.blur && activeElement._tippy) {
    activeElement.blur();
  }
};

var onWindowResize = function onWindowResize() {
  toArray$1(document.querySelectorAll(Selectors.POPPER)).forEach(function (popper) {
    var tippyInstance = popper._tippy;
    if (!tippyInstance.props.livePlacement) {
      tippyInstance.popperInstance.scheduleUpdate();
    }
  });
};

/**
 * Adds the needed global event listeners
 */
function bindEventListeners() {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('touchstart', onDocumentTouch);
  window.addEventListener('blur', onWindowBlur);
  window.addEventListener('resize', onWindowResize);

  if (!supportsTouch && (navigator.maxTouchPoints || navigator.msMaxTouchPoints)) {
    document.addEventListener('pointerdown', onDocumentTouch);
  }
}

var idCounter = 1;

function createTippy(reference, collectionProps) {
  var props = evaluateProps(reference, collectionProps);

  // If the reference shouldn't have multiple tippys, return null early
  if (!props.multiple && reference._tippy) {
    return null;
  }

  /* ======================= 🔒 Private members 🔒 ======================= */
  var popperMutationObserver = null;
  var popperHasEventListeners = false;
  var lastTriggerEvent = {};
  var lastMouseMoveEvent = {};
  var showTimeoutId = 0;
  var hideTimeoutId = 0;
  var isPreparingToShow = false;
  var transitionEndListener = function transitionEndListener() {};
  var listeners = [];
  var referenceJustProgrammaticallyFocused = false;

  /* ======================= 🔑 Public members 🔑 ======================= */
  var id = idCounter++;

  var popper = createPopperElement(id, props);

  var popperChildren = getChildren(popper);

  var state = {
    isEnabled: true,
    isVisible: false,
    isDestroyed: false
  };

  var popperInstance = null;

  // 🌟 tippy instance
  var tip = {
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
    set: set$$1,
    setContent: setContent$$1,
    show: show,
    hide: hide,
    enable: enable,
    disable: disable,
    destroy: destroy
  };

  addEventListenersToReference();

  if (!props.lazy) {
    tip.popperInstance = createPopperInstance();
    tip.popperInstance.disableEventListeners();
  }

  if (props.showOnInit) {
    /**
     * Firefox has a bug where the tooltip will be placed incorrectly due to
     * strange layout on load, `setTimeout` gives the layout time to adjust
     * properly
     */
    setTimeout(prepareShow, 20);
  }

  // Ensure the reference element can receive focus (and is not a delegate)
  if (props.a11y && !props.target && !elementCanReceiveFocus(reference)) {
    reference.setAttribute('tabindex', '0');
  }

  // Install shortcuts
  reference._tippy = tip;
  popper._tippy = tip;

  return tip;

  /* ======================= 🔒 Private methods 🔒 ======================= */
  /**
   * Listener for the `followCursor` prop
   */
  function followCursorListener(event) {
    var _lastMouseMoveEvent = lastMouseMoveEvent = event,
        clientX = _lastMouseMoveEvent.clientX,
        clientY = _lastMouseMoveEvent.clientY;

    if (!tip.popperInstance) {
      return;
    }

    tip.popperInstance.reference = {
      getBoundingClientRect: function getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          top: clientY,
          left: clientX,
          right: clientX,
          bottom: clientY
        };
      },
      clientWidth: 0,
      clientHeight: 0
    };

    tip.popperInstance.scheduleUpdate();
  }

  /**
   * Creates the tippy instance for a delegate when it's been triggered
   */
  function createDelegateChildTippy(event) {
    var targetEl = closest(event.target, tip.props.target);
    if (targetEl && !targetEl._tippy) {
      var content = tip.props.content;
      if (content) {
        createTippy(targetEl, _extends({}, tip.props, {
          content: content,
          target: '',
          showOnInit: true
        }));
        prepareShow(event);
      }
    }
  }

  /**
   * Setup before show() is invoked (delays, etc.)
   */
  function prepareShow(event) {
    clearDelayTimeouts();

    if (tip.state.isVisible) {
      return;
    }

    // Is a delegate, create an instance for the child target
    if (tip.props.target) {
      createDelegateChildTippy(event);
      return;
    }

    isPreparingToShow = true;

    if (tip.props.wait) {
      tip.props.wait(show, event);
      return;
    }

    /**
     * If the tooltip has a delay, we need to be listening to the mousemove as
     * soon as the trigger event is fired so that it's in the correct position
     * upon mount
     */
    if (hasFollowCursorBehavior()) {
      if (popperChildren.arrow) {
        popperChildren.arrow.style.margin = '0';
      }
      document.addEventListener('mousemove', followCursorListener);
    }

    var delay = getValue(tip.props.delay, 0, Defaults.delay);

    if (delay) {
      showTimeoutId = setTimeout(function () {
        show();
      }, delay);
    } else {
      show();
    }
  }

  /**
   * Setup before hide() is invoked (delays, etc.)
   */
  function prepareHide() {
    clearDelayTimeouts();

    if (!tip.state.isVisible) {
      return;
    }

    isPreparingToShow = false;

    var delay = getValue(tip.props.delay, 1, Defaults.delay);

    if (delay) {
      hideTimeoutId = setTimeout(function () {
        if (tip.state.isVisible) {
          hide();
        }
      }, delay);
    } else {
      hide();
    }
  }

  /**
   * Event listener invoked upon trigger
   */
  function onTrigger(event) {
    if (!tip.state.isEnabled) {
      return;
    }

    var shouldStopEvent = supportsTouch && isUsingTouch && ['mouseenter', 'mouseover', 'focus'].indexOf(event.type) > -1;

    if (shouldStopEvent && tip.props.touchHold) {
      return;
    }

    lastTriggerEvent = event;

    // Toggle show/hide when clicking click-triggered tooltips
    if (event.type === 'click' && tip.props.hideOnClick !== false && tip.state.isVisible) {
      prepareHide();
    } else {
      prepareShow(event);
    }
  }

  /**
   * Event listener used for interactive tooltips to detect when they should hide
   */
  function onMouseMove(event) {
    var referenceTheCursorIsOver = closestCallback(event.target, function (el) {
      return el._tippy;
    });

    var isCursorOverPopper = closest(event.target, Selectors.POPPER) === tip.popper;
    var isCursorOverReference = referenceTheCursorIsOver === tip.reference;

    if (isCursorOverPopper || isCursorOverReference) {
      return;
    }

    if (isCursorOutsideInteractiveBorder(getPopperPlacement(tip.popper), tip.popper.getBoundingClientRect(), event, tip.props)) {
      document.body.removeEventListener('mouseleave', prepareHide);
      document.removeEventListener('mousemove', onMouseMove);

      prepareHide();
    }
  }

  /**
   * Event listener invoked upon mouseleave
   */
  function onMouseLeave(event) {
    if (['mouseleave', 'mouseout'].indexOf(event.type) > -1 && supportsTouch && isUsingTouch && tip.props.touchHold) {
      return;
    }

    if (tip.props.interactive) {
      document.body.addEventListener('mouseleave', prepareHide);
      document.addEventListener('mousemove', onMouseMove);
      return;
    }

    prepareHide();
  }

  /**
   * Event listener invoked upon blur
   */
  function onBlur(event) {
    if (event.target !== tip.reference || isUsingTouch) {
      return;
    }

    if (tip.props.interactive) {
      if (!event.relatedTarget) {
        return;
      }
      if (closest(event.relatedTarget, Selectors.POPPER)) {
        return;
      }
    }

    prepareHide();
  }

  /**
   * Event listener invoked when a child target is triggered
   */
  function onDelegateShow(event) {
    if (closest(event.target, tip.props.target)) {
      prepareShow(event);
    }
  }

  /**
   * Event listener invoked when a child target should hide
   */
  function onDelegateHide(event) {
    if (closest(event.target, tip.props.target)) {
      prepareHide();
    }
  }

  /**
   * Creates the popper instance for the tip
   */
  function createPopperInstance() {
    var tooltip = tip.popperChildren.tooltip;
    var popperOptions = tip.props.popperOptions;


    var arrowSelector = Selectors[tip.props.arrowType === 'round' ? 'ROUND_ARROW' : 'ARROW'];
    var arrow = tooltip.querySelector(arrowSelector);

    var config = _extends({
      placement: tip.props.placement
    }, popperOptions || {}, {
      modifiers: _extends({}, popperOptions ? popperOptions.modifiers : {}, {
        arrow: _extends({
          element: arrowSelector
        }, popperOptions && popperOptions.modifiers ? popperOptions.modifiers.arrow : {}),
        flip: _extends({
          enabled: tip.props.flip,
          padding: tip.props.distance + 5 /* 5px from viewport boundary */
          , behavior: tip.props.flipBehavior
        }, popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {}),
        offset: _extends({
          offset: tip.props.offset
        }, popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {})
      }),
      onCreate: function onCreate() {
        tooltip.style[getPopperPlacement(tip.popper)] = getOffsetDistanceInPx(tip.props.distance, Defaults.distance);

        if (arrow && tip.props.arrowTransform) {
          computeArrowTransform(arrow, tip.props.arrowTransform);
        }
      },
      onUpdate: function onUpdate() {
        var styles = tooltip.style;
        styles.top = '';
        styles.bottom = '';
        styles.left = '';
        styles.right = '';
        styles[getPopperPlacement(tip.popper)] = getOffsetDistanceInPx(tip.props.distance, Defaults.distance);

        if (arrow && tip.props.arrowTransform) {
          computeArrowTransform(arrow, tip.props.arrowTransform);
        }
      }
    });

    /**
     * Ensure the popper's position stays correct if its dimensions change.
     * Use .update() over .scheduleUpdate() so there is no 1 frame flash
     * due to async update.
     */
    var observer = new MutationObserver(function () {
      tip.popperInstance.update();
    });
    observer.observe(tip.popper, { childList: true, subtree: true });
    if (popperMutationObserver) {
      popperMutationObserver.disconnect();
    }
    popperMutationObserver = observer;

    // fixes https://github.com/atomiks/tippyjs/issues/193
    if (!popperHasEventListeners) {
      tip.popper.addEventListener('mouseenter', prepareShow);
      tip.popper.addEventListener('mouseleave', prepareHide);
      popperHasEventListeners = true;
    }

    return new Popper(tip.reference, tip.popper, config);
  }

  /**
   * Mounts the tooltip to the DOM
   */
  function mount(onceUpdated) {
    if (!tip.popperInstance) {
      tip.popperInstance = createPopperInstance();
      if (!tip.props.livePlacement) {
        tip.popperInstance.disableEventListeners();
      }
    } else {
      tip.popperInstance.scheduleUpdate();
      if (tip.props.livePlacement && !hasFollowCursorBehavior()) {
        tip.popperInstance.enableEventListeners();
      }
    }

    /**
     * If the instance previously had followCursor behavior, it will be
     * positioned incorrectly if triggered by `focus` afterwards.
     * Update the reference back to the real DOM element
     */
    tip.popperInstance.reference = tip.reference;
    if (hasFollowCursorBehavior()) {
      if (tip.popperChildren.arrow) {
        tip.popperChildren.arrow.style.margin = '';
      }
    }

    updatePopperPosition(tip.popperInstance, onceUpdated, true);

    if (!tip.props.appendTo.contains(tip.popper)) {
      tip.props.appendTo.appendChild(tip.popper);
    }
  }

  /**
   * Determines if the instance is in `followCursor` mode
   */
  function hasFollowCursorBehavior() {
    return tip.props.followCursor && !isUsingTouch && lastTriggerEvent.type !== 'focus';
  }

  /**
   * Updates the tooltip's position on each animation frame + timeout
   */
  function makeSticky() {
    var updatePosition = function updatePosition() {
      applyTransitionDuration([tip.popper], tip.props.updateDuration);

      if (tip.popperInstance) {
        tip.popperInstance.scheduleUpdate();
      }

      if (tip.state.isVisible) {
        requestAnimationFrame(function () {
          defer(updatePosition);
        });
      } else {
        applyTransitionDuration([tip.popper], 0);
      }
    };

    updatePosition();
  }

  /**
   * Invokes a callback once the tooltip has fully transitioned out
   */
  function onTransitionedOut(duration, callback) {
    onTransitionEnd(false, duration, function () {
      if (!tip.state.isVisible && tip.props.appendTo.contains(tip.popper)) {
        callback();
      }
    });
  }

  /**
   * Invokes a callback once the tooltip has fully transitioned in
   */
  function onTransitionedIn(duration, callback) {
    onTransitionEnd(true, duration, callback);
  }

  /**
   * Invokes a callback once the tooltip's CSS transition ends
   */
  function onTransitionEnd(isInDirection, duration, callback) {
    // Make callback synchronous if duration is 0
    if (duration === 0) {
      return callback();
    }

    var tooltip = tip.popperChildren.tooltip;


    var listener = function listener(e) {
      if (e.target === tooltip && getComputedStyle(tooltip).opacity === (isInDirection ? '1' : '0')) {
        toggleTransitionEndListener(tooltip, 'remove', listener);
        callback();
      }
    };

    toggleTransitionEndListener(tooltip, 'remove', transitionEndListener);
    toggleTransitionEndListener(tooltip, 'add', listener);

    transitionEndListener = listener;
  }

  /**
   * Adds an event listener to the reference
   */
  function on(eventType, handler, acc) {
    tip.reference.addEventListener(eventType, handler);
    acc.push({ eventType: eventType, handler: handler });
  }

  /**
   * Adds event listeners to the reference based on the `trigger` prop
   */
  function addEventListenersToReference() {
    listeners = tip.props.trigger.trim().split(' ').reduce(function (acc, eventType) {
      if (eventType === 'manual') {
        return acc;
      }

      if (!props.target) {
        on(eventType, onTrigger, acc);
        switch (eventType) {
          case 'mouseenter':
            on('mouseleave', onMouseLeave, acc);
            break;
          case 'focus':
            on(isIE ? 'focusout' : 'blur', onBlur, acc);
            break;
        }
      } else {
        switch (eventType) {
          case 'mouseenter':
            on('mouseover', onDelegateShow, acc);
            on('mouseout', onDelegateHide, acc);
            break;
          case 'focus':
            on('focusin', onDelegateShow, acc);
            on('focusout', onDelegateHide, acc);
            break;
          case 'click':
            on(eventType, onDelegateShow, acc);
            break;
        }
      }

      return acc;
    }, []);
  }

  /**
   * Removes event listeners from the reference
   */
  function removeEventListenersFromReference() {
    listeners.forEach(function (_ref) {
      var eventType = _ref.eventType,
          handler = _ref.handler;

      tip.reference.removeEventListener(eventType, handler);
    });
  }

  /* ======================= 🔑 Public methods 🔑 ======================= */
  /**
   * Enables the instance to allow it to show or hide
   */
  function enable() {
    tip.state.isEnabled = true;
  }

  /**
   * Disables the instance to disallow it to show or hide
   */
  function disable() {
    tip.state.isEnabled = false;
  }

  /**
   * Clears pending timeouts related to the `delay` prop if any
   */
  function clearDelayTimeouts() {
    clearTimeout(showTimeoutId);
    clearTimeout(hideTimeoutId);
  }

  /**
   * Sets new props for the instance and redraws the tooltip
   */
  function set$$1(options) {
    var prevProps = tip.props;
    var nextProps = evaluateProps(tip.reference, _extends({}, tip.props, options, {
      performance: true
    }));
    nextProps.performance = options.performance || prevProps.performance;
    tip.props = nextProps;

    // Update listeners if `trigger` option changed
    if (options.trigger) {
      removeEventListenersFromReference();
      addEventListenersToReference();
    }

    // Redraw
    updatePopperElement(tip.popper, prevProps, nextProps);
    tip.popperChildren = getChildren(tip.popper);
    tip.popperInstance && (tip.popperInstance = createPopperInstance());
  }

  /**
   * Shortcut for .set({ content: newContent })
   */
  function setContent$$1(content) {
    set$$1({ content: content });
  }

  /**
   * Shows the tooltip
   */
  function show() {
    var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getValue(tip.props.duration, 0, Defaults.duration[0]);

    if (tip.state.isDestroyed || !tip.state.isEnabled || isUsingTouch && !tip.props.touch) {
      return;
    }

    // Destroy tooltip if the reference element is no longer on the DOM
    if (!tip.reference.isVirtual && !document.documentElement.contains(tip.reference)) {
      return destroy();
    }

    // Do not show tooltip if the reference element has a `disabled` attribute
    if (tip.reference.hasAttribute('disabled')) {
      return;
    }

    // If the reference was just programmatically focused for accessibility reasons
    if (referenceJustProgrammaticallyFocused) {
      referenceJustProgrammaticallyFocused = false;
      return;
    }

    tip.props.onShow(tip);

    tip.popper.style.visibility = 'visible';
    tip.state.isVisible = true;

    // Prevent a transition if the popper is at the opposite placement
    applyTransitionDuration([tip.popper, tip.popperChildren.tooltip, tip.popperChildren.backdrop], 0);

    mount(function () {
      if (!tip.state.isVisible) {
        return;
      }

      if (!hasFollowCursorBehavior()) {
        // Arrow will sometimes not be positioned correctly. Force another update.
        tip.popperInstance.scheduleUpdate();
      }

      // Set initial position near the cursor
      if (hasFollowCursorBehavior()) {
        tip.popperInstance.disableEventListeners();
        var delay = getValue(tip.props.delay, 0, Defaults.delay);
        if (lastTriggerEvent) {
          followCursorListener(delay && lastMouseMoveEvent ? lastMouseMoveEvent : lastTriggerEvent);
        }
      }

      applyTransitionDuration([tip.popperChildren.tooltip, tip.popperChildren.backdrop, tip.popperChildren.backdrop ? tip.popperChildren.content : null], duration);

      if (tip.props.interactive) {
        tip.reference.classList.add('tippy-active');
      }

      if (tip.props.sticky) {
        makeSticky();
      }

      setVisibilityState([tip.popperChildren.tooltip, tip.popperChildren.backdrop], 'visible');

      onTransitionedIn(duration, function () {
        if (tip.props.updateDuration === 0) {
          tip.popperChildren.tooltip.classList.add('tippy-notransition');
        }

        if (tip.props.interactive && lastTriggerEvent.type === 'focus') {
          focus(tip.popper);
        }

        tip.reference.setAttribute('aria-describedby', tip.popper.id);

        tip.props.onShown(tip);
      });
    });
  }

  /**
   * Hides the tooltip
   */
  function hide() {
    var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getValue(tip.props.duration, 1, Defaults.duration[1]);

    if (tip.state.isDestroyed || !tip.state.isEnabled) {
      return;
    }

    tip.props.onHide(tip);

    if (tip.props.updateDuration === 0) {
      tip.popperChildren.tooltip.classList.remove('tippy-notransition');
    }

    if (tip.props.interactive) {
      tip.reference.classList.remove('tippy-active');
    }

    tip.popper.style.visibility = 'hidden';
    tip.state.isVisible = false;

    applyTransitionDuration([tip.popperChildren.tooltip, tip.popperChildren.backdrop, tip.popperChildren.backdrop ? tip.popperChildren.content : null], duration);

    setVisibilityState([tip.popperChildren.tooltip, tip.popperChildren.backdrop], 'hidden');

    if (tip.props.interactive && !referenceJustProgrammaticallyFocused && lastTriggerEvent.type === 'focus') {
      referenceJustProgrammaticallyFocused = true;
      focus(tip.reference);
    }

    onTransitionedOut(duration, function () {
      if (!isPreparingToShow) {
        document.removeEventListener('mousemove', followCursorListener);
        lastMouseMoveEvent = null;
      }

      tip.reference.removeAttribute('aria-describedby');

      tip.popperInstance.disableEventListeners();

      tip.props.appendTo.removeChild(tip.popper);

      tip.props.onHidden(tip);
    });
  }

  /**
   * Destroys the tooltip
   */
  function destroy(destroyTargetInstances) {
    if (tip.state.isDestroyed) {
      return;
    }

    // Ensure the popper is hidden
    if (tip.state.isVisible) {
      hide(0);
    }

    removeEventListenersFromReference();

    delete tip.reference._tippy;

    if (tip.props.target && destroyTargetInstances) {
      toArray$1(tip.reference.querySelectorAll(tip.props.target)).forEach(function (child) {
        return child._tippy && child._tippy.destroy();
      });
    }

    if (tip.popperInstance) {
      tip.popperInstance.destroy();
    }

    if (popperMutationObserver) {
      popperMutationObserver.disconnect();
    }

    tip.state.isDestroyed = true;
  }
}

var eventListenersBound = false;

function tippy$1(targets, options, one) {
  if (!eventListenersBound) {
    bindEventListeners();
    eventListenersBound = true;
  }

  // Throw an error if the user supplied an invalid option
  for (var key in options || {}) {
    if (!(key in Defaults)) {
      throw Error('[tippy]: ' + key + ' is not a valid option');
    }
  }

  var props = _extends({}, Defaults, options);

  /**
   * If they are specifying a virtual positioning reference, we need to polyfill
   * some native DOM props
   */
  if (isPlainObject(targets)) {
    polyfillVirtualReferenceProps(targets);
  }

  var references = getArrayOfElements(targets);
  var firstReference = references[0];

  var instances = (one && firstReference ? [firstReference] : references).reduce(function (acc, reference) {
    var tip = reference ? createTippy(reference, props) : null;
    return tip ? acc.concat(tip) : acc;
  }, []);

  return {
    targets: targets,
    props: props,
    instances: instances,
    destroyAll: function destroyAll() {
      this.instances.forEach(function (instance) {
        instance.destroy();
      });
      this.instances = [];
    }
  };
}

/**
 * Static props
 */
tippy$1.version = version;
tippy$1.defaults = Defaults;

/**
 * Static methods
 */
tippy$1.setDefaults = setDefaults;
tippy$1.one = function (targets, options) {
  return tippy$1(targets, options, true).instances[0];
};
tippy$1.disableAnimations = function () {
  setDefaults({
    duration: 0,
    updateDuration: 0,
    animateFill: false
  });
};

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
var autoInit = function autoInit() {
  toArray$1(document.querySelectorAll('[data-tippy]')).forEach(function (el) {
    var content = el.getAttribute('data-tippy');
    if (content) {
      tippy$1(el, { content: content });
    }
  });
};
if (isBrowser) {
  setTimeout(autoInit);
}

return tippy$1;

})));
