(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('popper.js')) :
	typeof define === 'function' && define.amd ? define(['popper.js'], factory) :
	(global.tippy = factory(global.Popper));
}(this, (function (Popper) { 'use strict';

Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

var isBrowser = typeof window !== 'undefined';

var browser = {};

if (isBrowser) {
  browser.supported = 'requestAnimationFrame' in window;
  browser.supportsTouch = 'ontouchstart' in window;
  browser.usingTouch = false;
  browser.eventsBound = false;
  browser.dynamicInputDetection = true;
  browser.iOS = /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream;
}

/**
* Selector constants used for grabbing elements
*/
var selectors = {
  POPPER: '.tippy-popper',
  TOOLTIP: '.tippy-tooltip',
  CONTENT: '.tippy-content',
  BACKDROP: '.tippy-backdrop',
  ARROW: '.tippy-arrow',
  ROUND_ARROW: '.tippy-roundarrow',
  REFERENCE: '[data-tippy]'

  /**
  * The default options applied to each instance
  */
};var defaults = {
  placement: 'top',
  trigger: 'mouseenter focus',
  animation: 'shift-away',
  html: false,
  animateFill: true,
  arrow: false,
  delay: 0,
  duration: [350, 300],
  interactive: false,
  interactiveBorder: 2,
  theme: 'dark',
  size: 'regular',
  distance: 10,
  offset: 0,
  hideOnClick: true,
  multiple: false,
  followCursor: false,
  inertia: false,
  updateDuration: 350,
  sticky: false,
  stickyDuration: 200,
  appendTo: function appendTo() {
    return document.body;
  },
  zIndex: 9999,
  touchHold: false,
  performance: false,
  dynamicTitle: false,
  flip: true,
  flipBehavior: 'flip',
  arrowType: 'sharp',
  arrowTransform: '',
  maxWidth: '',
  popperOptions: {},
  createPopperInstanceOnInit: false,
  onShow: function onShow() {},
  onShown: function onShown() {},
  onHide: function onHide() {},
  onHidden: function onHidden() {}
};

/**
* The keys of the defaults object for reducing down into a new object
* Used in `getIndividualOptions()`
*/
var defaultsKeys = browser.supported && Object.keys(defaults);

/**
* Determines if a value is an object literal
* @param {*} value
* @return {Boolean}
*/
function isObjectLiteral(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
* Returns an array of elements based on the selector input
* @param {String|Element|Element[]|NodeList|Object} selector
* @return {Element[]}
*/
function getArrayOfElements(selector) {
  if (selector instanceof Element || isObjectLiteral(selector)) {
    return [selector];
  }

  if (selector instanceof NodeList) {
    return [].slice.call(selector);
  }

  if (Array.isArray(selector)) {
    return selector;
  }

  try {
    return [].slice.call(document.querySelectorAll(selector));
  } catch (_) {
    return [];
  }
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







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

/**
* Returns an object of settings to override global settings
* @param {Element} reference
* @param {Object} instanceOptions
* @return {Object} - individual options
*/
function getIndividualOptions(reference, instanceOptions) {
  var options = defaultsKeys.reduce(function (acc, key) {
    var val = reference.getAttribute('data-tippy-' + key.toLowerCase()) || instanceOptions[key];

    // Convert strings to booleans
    if (val === 'false') val = false;
    if (val === 'true') val = true;

    // Convert number strings to true numbers
    if (isFinite(val) && !isNaN(parseFloat(val))) {
      val = parseFloat(val);
    }

    // Convert array strings to actual arrays
    if (typeof val === 'string' && val.trim().charAt(0) === '[') {
      val = JSON.parse(val);
    }

    acc[key] = val;

    return acc;
  }, {});

  return _extends({}, instanceOptions, options);
}

/**
* Returns the supported prefixed property - only `webkit` is needed, `moz`, `ms` and `o` are obsolete
* @param {String} property
* @return {String} - browser supported prefixed property
*/
function prefix(property) {
  var prefixes = [false, 'webkit'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var _prefix = prefixes[i];
    var prefixedProp = _prefix ? '' + _prefix + upperProp : property;
    if (typeof document.body.style[prefixedProp] !== 'undefined') {
      return prefixedProp;
    }
  }

  return null;
}

/**
* Creates a popper element then returns it
* @param {Number} id - the popper id
* @param {String} title - the tooltip's `title` attribute
* @param {Object} options - individual options
* @return {Element} - the popper element
*/
function createPopperElement(id, title, options) {
  var placement = options.placement,
      distance = options.distance,
      arrow = options.arrow,
      arrowType = options.arrowType,
      arrowTransform = options.arrowTransform,
      animateFill = options.animateFill,
      inertia = options.inertia,
      animation = options.animation,
      size = options.size,
      theme = options.theme,
      html = options.html,
      zIndex = options.zIndex,
      interactive = options.interactive,
      maxWidth = options.maxWidth;


  var popper = document.createElement('div');
  popper.setAttribute('class', 'tippy-popper');
  popper.setAttribute('role', 'tooltip');
  popper.setAttribute('aria-hidden', 'true');
  popper.setAttribute('id', 'tippy-' + id);
  popper.style.zIndex = zIndex;
  popper.style.maxWidth = maxWidth;

  var tooltip = document.createElement('div');
  tooltip.setAttribute('class', 'tippy-tooltip');
  tooltip.setAttribute('data-size', size);
  tooltip.setAttribute('data-animation', animation);
  tooltip.setAttribute('data-state', 'hidden');

  theme.split(' ').forEach(function (t) {
    tooltip.classList.add(t + '-theme');
  });

  if (arrow) {
    var _arrow = document.createElement('div');
    _arrow.style[prefix('transform')] = arrowTransform;

    if (arrowType === 'round') {
      _arrow.classList.add('tippy-roundarrow');
      _arrow.innerHTML = '\n      <svg width="100%" height="100%" viewBox="0 0 64 20" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">\n        <g transform="matrix(1.04009,0,0,1.45139,-1.26297,-65.9145)">\n          <path d="M1.214,59.185C1.214,59.185 12.868,59.992 21.5,51.55C29.887,43.347 33.898,43.308 42.5,51.55C51.352,60.031 62.747,59.185 62.747,59.185L1.214,59.185Z"/>\n        </g>\n      </svg>';
    } else {
      _arrow.classList.add('tippy-arrow');
    }

    tooltip.appendChild(_arrow);
  }

  if (animateFill) {
    // Create animateFill circle element for animation
    tooltip.setAttribute('data-animatefill', '');
    var circle = document.createElement('div');
    circle.setAttribute('data-state', 'hidden');
    circle.classList.add('tippy-backdrop');
    tooltip.appendChild(circle);
  }

  if (inertia) {
    // Change transition timing function cubic bezier
    tooltip.setAttribute('data-inertia', '');
  }

  if (interactive) {
    tooltip.setAttribute('data-interactive', '');
  }

  var content = document.createElement('div');
  content.setAttribute('class', 'tippy-content');

  if (html) {
    var templateId = void 0;

    if (html instanceof Element) {
      content.appendChild(html);
      templateId = '#' + html.id || 'tippy-html-template';
    } else {
      content.innerHTML = document.querySelector(html).innerHTML;
      templateId = html;
    }

    popper.setAttribute('data-html', '');
    interactive && popper.setAttribute('tabindex', '-1');
    tooltip.setAttribute('data-template-id', templateId);
  } else {
    content.innerHTML = title;
  }

  tooltip.appendChild(content);
  popper.appendChild(tooltip);

  return popper;
}

/**
* Transforms the `arrowTransform` numbers based on the placement axis
* @param {String} type 'scale' or 'translate'
* @param {Number[]} numbers
* @param {Boolean} isVertical
* @param {Boolean} isReverse
* @return {String}
*/
function transformNumbersBasedOnPlacementAxis(type, numbers, isVertical, isReverse) {
  if (!numbers.length) return '';

  var transforms = {
    scale: function () {
      if (numbers.length === 1) {
        return '' + numbers[0];
      } else {
        return isVertical ? numbers[0] + ', ' + numbers[1] : numbers[1] + ', ' + numbers[0];
      }
    }(),
    translate: function () {
      if (numbers.length === 1) {
        return isReverse ? -numbers[0] + 'px' : numbers[0] + 'px';
      } else {
        if (isVertical) {
          return isReverse ? numbers[0] + 'px, ' + -numbers[1] + 'px' : numbers[0] + 'px, ' + numbers[1] + 'px';
        } else {
          return isReverse ? -numbers[1] + 'px, ' + numbers[0] + 'px' : numbers[1] + 'px, ' + numbers[0] + 'px';
        }
      }
    }()
  };

  return transforms[type];
}

/**
* Transforms the `arrowTransform` x or y axis based on the placement axis
* @param {String} axis 'X', 'Y', ''
* @param {Boolean} isVertical
* @return {String}
*/
function transformAxis(axis, isVertical) {
  if (!axis) return '';
  var map = {
    'X': 'Y',
    'Y': 'X'
  };
  return isVertical ? axis : map[axis];
}

/**
* Returns the core placement ('top', 'bottom', 'left', 'right') of a popper
* @param {Element} popper
* @return {String}
*/
function getPopperPlacement(popper) {
  return popper.getAttribute('x-placement').replace(/-.+/, '');
}

/**
* Computes and applies the necessary arrow transform
* @param {Element} popper
* @param {Element} arrow
* @param {String} arrowTransform
*/
function computeArrowTransform(popper, arrow, arrowTransform) {
  var placement = getPopperPlacement(popper);
  var isVertical = placement === 'top' || placement === 'bottom';
  var isReverse = placement === 'right' || placement === 'bottom';

  var getAxis = function getAxis(re) {
    var match = arrowTransform.match(re);
    return match ? match[1] : '';
  };

  var getNumbers = function getNumbers(re) {
    var match = arrowTransform.match(re);
    return match ? match[1].split(',').map(parseFloat) : [];
  };

  var re = {
    translate: /translateX?Y?\(([^)]+)\)/,
    scale: /scaleX?Y?\(([^)]+)\)/
  };

  var matches = {
    translate: {
      axis: getAxis(/translate([XY])/),
      numbers: getNumbers(re.translate)
    },
    scale: {
      axis: getAxis(/scale([XY])/),
      numbers: getNumbers(re.scale)
    }
  };

  var computedTransform = arrowTransform.replace(re.translate, 'translate' + transformAxis(matches.translate.axis, isVertical) + '(' + transformNumbersBasedOnPlacementAxis('translate', matches.translate.numbers, isVertical, isReverse) + ')').replace(re.scale, 'scale' + transformAxis(matches.scale.axis, isVertical) + '(' + transformNumbersBasedOnPlacementAxis('scale', matches.scale.numbers, isVertical, isReverse) + ')');

  arrow.style[prefix('transform')] = computedTransform;
}

/**
* Waits until next repaint to execute a fn
* @param {Function} fn
*/
function defer(fn) {
  requestAnimationFrame(function () {
    setTimeout(fn, 0);
  });
}

/**
* Determines if an element is currently visible
* @param {Element} el
* @return {Boolean}
*/
function isVisible(el) {
  return el.style.visibility === 'visible';
}

/**
* Returns inner elements of the popper element
* @param {Element} popper
* @return {Object}
*/
function getInnerElements(popper) {
  return {
    tooltip: popper.querySelector(selectors.TOOLTIP),
    backdrop: popper.querySelector(selectors.BACKDROP),
    content: popper.querySelector(selectors.CONTENT)
  };
}

/**
* Returns the distance taking into account the default distance due to
* the transform: translate setting in CSS
* @param {Number} distance
* @return {String}
*/
function getOffsetDistanceInPx(distance) {
  return -(distance - defaults.distance) + 'px';
}

/**
* Adds a mutation observer to an element and stores it in the instance
* @param {Object}
*/
function addMutationObserver(_ref) {
  var tippy = _ref.tippy,
      target = _ref.target,
      callback = _ref.callback,
      options = _ref.options;

  if (!window.MutationObserver) return;

  var observer = new MutationObserver(callback);
  observer.observe(target, options);
  tippy._mutationObservers.push(observer);
}

/**
* Creates a new popper instance
* @param {Tippy} tippy
* @return {Popper}
*/
function createPopperInstance(tippy) {
  var reference = tippy.reference,
      popper = tippy.popper,
      _tippy$options = tippy.options,
      placement = _tippy$options.placement,
      popperOptions = _tippy$options.popperOptions,
      offset = _tippy$options.offset,
      distance = _tippy$options.distance,
      updateDuration = _tippy$options.updateDuration,
      flip = _tippy$options.flip,
      flipBehavior = _tippy$options.flipBehavior,
      arrowType = _tippy$options.arrowType,
      arrowTransform = _tippy$options.arrowTransform;

  var _getInnerElements = getInnerElements(popper),
      tooltip = _getInnerElements.tooltip;

  var arrowSelector = arrowType === 'round' ? selectors.ROUND_ARROW : selectors.ARROW;
  var arrow = tooltip.querySelector(arrowSelector);

  var config = _extends({
    placement: placement
  }, popperOptions || {}, {
    modifiers: _extends({}, popperOptions ? popperOptions.modifiers : {}, {
      arrow: _extends({
        element: arrowSelector
      }, popperOptions && popperOptions.modifiers ? popperOptions.modifiers.arrow : {}),
      flip: _extends({
        enabled: flip,
        padding: distance + 5 /* 5px from viewport boundary */
        , behavior: flipBehavior
      }, popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {}),
      offset: _extends({
        offset: offset
      }, popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {})
    }),
    onCreate: function onCreate() {
      tooltip.style[getPopperPlacement(popper)] = getOffsetDistanceInPx(distance);

      if (arrow && arrowTransform) {
        computeArrowTransform(popper, arrow, arrowTransform);
      }
    },
    onUpdate: function onUpdate() {
      var styles = tooltip.style;
      styles.top = '';
      styles.bottom = '';
      styles.left = '';
      styles.right = '';
      styles[getPopperPlacement(popper)] = getOffsetDistanceInPx(distance);

      if (arrow && arrowTransform) {
        computeArrowTransform(popper, arrow, arrowTransform);
      }
    }
  });

  addMutationObserver({
    tippy: tippy,
    target: popper,
    callback: function callback() {
      var styles = popper.style;
      styles[prefix('transitionDuration')] = '0ms';
      tippy.popperInstance.update();
      defer(function () {
        styles[prefix('transitionDuration')] = updateDuration + 'ms';
      });
    },

    options: {
      childList: true,
      subtree: true,
      characterData: true
    }
  });

  return new Popper(reference, popper, config);
}

/**
* Creates a trigger by adding the necessary event listeners to the reference element
* @param {String} eventType - the custom event specified in the `trigger` setting
* @param {Element} reference
* @param {Object} handlers - the handlers for each event
* @param {Boolean} touchHold
* @return {Array} - array of listener objects
*/
function createTrigger(eventType, reference, handlers, touchHold) {
  var listeners = [];

  if (eventType === 'manual') return listeners;

  // Show
  reference.addEventListener(eventType, handlers.handleTrigger);
  listeners.push({
    event: eventType,
    handler: handlers.handleTrigger
  });

  // Hide
  if (eventType === 'mouseenter') {
    if (browser.supportsTouch && touchHold) {
      reference.addEventListener('touchstart', handlers.handleTrigger);
      listeners.push({
        event: 'touchstart',
        handler: handlers.handleTrigger
      });
      reference.addEventListener('touchend', handlers.handleMouseleave);
      listeners.push({
        event: 'touchend',
        handler: handlers.handleMouseleave
      });
    }

    reference.addEventListener('mouseleave', handlers.handleMouseleave);
    listeners.push({
      event: 'mouseleave',
      handler: handlers.handleMouseleave
    });
  }

  if (eventType === 'focus') {
    reference.addEventListener('blur', handlers.handleBlur);
    listeners.push({
      event: 'blur',
      handler: handlers.handleBlur
    });
  }

  return listeners;
}

var matches = {};

if (isBrowser) {
  var e = Element.prototype;
  matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || function (s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s);
    var i = matches.length;
    while (--i >= 0 && matches.item(i) !== this) {}
    return i > -1;
  };
}

var matches$1 = matches;

/**
* Ponyfill to get the closest parent element
* @param {Element} element - child of parent to be returned
* @param {String} parentSelector - selector to match the parent if found
* @return {Element}
*/
function closest(element, parentSelector) {
  var fn = Element.prototype.closest || function (selector) {
    var el = this;
    while (el) {
      if (matches$1.call(el, selector)) {
        return el;
      }
      el = el.parentElement;
    }
  };

  return fn.call(element, parentSelector);
}

/**
* Determines if the mouse's cursor is outside the interactive border
* @param {MouseEvent} event
* @param {Element} popper
* @param {Object} options
* @return {Boolean}
*/
function cursorIsOutsideInteractiveBorder(event, popper, options) {
  if (!popper.getAttribute('x-placement')) return true;

  var x = event.clientX,
      y = event.clientY;
  var interactiveBorder = options.interactiveBorder,
      distance = options.distance;


  var rect = popper.getBoundingClientRect();
  var placement = getPopperPlacement(popper);
  var borderWithDistance = interactiveBorder + distance;

  var exceeds = {
    top: rect.top - y > interactiveBorder,
    bottom: y - rect.bottom > interactiveBorder,
    left: rect.left - x > interactiveBorder,
    right: x - rect.right > interactiveBorder
  };

  switch (placement) {
    case 'top':
      exceeds.top = rect.top - y > borderWithDistance;
      break;
    case 'bottom':
      exceeds.bottom = y - rect.bottom > borderWithDistance;
      break;
    case 'left':
      exceeds.left = rect.left - x > borderWithDistance;
      break;
    case 'right':
      exceeds.right = x - rect.right > borderWithDistance;
      break;
  }

  return exceeds.top || exceeds.bottom || exceeds.left || exceeds.right;
}

/**
* Returns relevant listeners for each Tippy instance
* @param {Tippy} tippy
* @param {Object} options
* @return {Object} of listeners
*/
function getEventListeners(tippy, options) {
  var popper = tippy.popper,
      reference = tippy.reference,
      _tippy$options = tippy.options,
      delay = _tippy$options.delay,
      duration = _tippy$options.duration,
      interactive = _tippy$options.interactive,
      interactiveBorder = _tippy$options.interactiveBorder,
      hideOnClick = _tippy$options.hideOnClick,
      trigger = _tippy$options.trigger,
      touchHold = _tippy$options.touchHold;


  var showDelay = void 0,
      hideDelay = void 0;

  var clearTimeouts = function clearTimeouts() {
    clearTimeout(showDelay);
    clearTimeout(hideDelay);
  };

  var _show = function _show() {
    clearTimeouts();

    if (isVisible(popper)) return;

    var _delay = Array.isArray(delay) ? delay[0] : delay;

    if (delay) {
      showDelay = setTimeout(function () {
        return tippy.show();
      }, _delay);
    } else {
      tippy.show();
    }
  };

  var show = function show(event) {
    tippy.options.wait ? tippy.options.wait.call(popper, _show, event) : _show();
  };

  var hide = function hide() {
    clearTimeouts();

    if (!isVisible(popper)) return;

    var _delay = Array.isArray(delay) ? delay[1] : delay;

    if (delay) {
      hideDelay = setTimeout(function () {
        if (!isVisible(popper)) return;
        tippy.hide();
      }, _delay);
    } else {
      tippy.hide();
    }
  };

  var handleTrigger = function handleTrigger(event) {
    var shouldStopEvent = browser.supportsTouch && browser.usingTouch && (event.type === 'mouseenter' || event.type === 'focus');

    if (shouldStopEvent && touchHold) return;

    tippy._lastTriggerEvent = event.type;

    // Toggle show/hide when clicking click-triggered tooltips
    var isClick = event.type === 'click';
    var isNotPersistent = hideOnClick !== 'persistent';

    isClick && isVisible(popper) && isNotPersistent ? hide() : show(event);

    // iOS prevents click events from firing
    if (shouldStopEvent && browser.iOS && reference.click) {
      reference.click();
    }
  };

  var handleMouseleave = function handleMouseleave(event) {
    if (event.type === 'mouseleave' && browser.supportsTouch && browser.usingTouch && touchHold) return;

    if (interactive) {
      // Temporarily handle mousemove to check if the mouse left somewhere other than the popper
      var handleMousemove = function handleMousemove(event) {
        var referenceCursorIsOver = closest(event.target, selectors.REFERENCE);
        var cursorIsOverPopper = closest(event.target, selectors.POPPER) === popper;
        var cursorIsOverReference = referenceCursorIsOver === reference;

        if (cursorIsOverPopper || cursorIsOverReference) return;

        if (cursorIsOutsideInteractiveBorder(event, popper, options)) {
          document.body.removeEventListener('mouseleave', hide);
          document.removeEventListener('mousemove', handleMousemove);
          hide();
        }
      };
      document.body.addEventListener('mouseleave', hide);
      document.addEventListener('mousemove', handleMousemove);
      return;
    }

    hide();
  };

  var handleBlur = function handleBlur(event) {
    if (!event.relatedTarget || browser.usingTouch) return;
    if (closest(event.relatedTarget, selectors.POPPER)) return;
    hide();
  };

  return {
    handleTrigger: handleTrigger,
    handleMouseleave: handleMouseleave,
    handleBlur: handleBlur
  };
}

/**
* Evaluates/modifies the options object for appropriate behavior
* @param {Element|Object} reference
* @param {Object} options
* @return {Object} modified/evaluated options
*/
function evaluateOptions(reference, options) {
  // animateFill is disabled if an arrow is true
  if (options.arrow) {
    options.animateFill = false;
  }

  if (options.appendTo && typeof options.appendTo === 'function') {
    options.appendTo = options.appendTo();
  }

  if (typeof options.html === 'function') {
    options.html = options.html(reference);
  }

  return options;
}

/**
* Removes the title from an element, setting `data-original-title`
* appropriately
* @param {Element} el
*/
function removeTitle(el) {
  var title = el.getAttribute('title');
  // Only set `data-original-title` attr if there is a title
  if (title) {
    el.setAttribute('data-original-title', title);
  }
  el.removeAttribute('title');
}

/**
* Ponyfill for Array.prototype.find
* @param {Array} arr
* @param {Function} fn
* @return item in the array
*/

/**
* Creates a mousemove event listener function for `followCursor` option
* @param {Tippy} tippy
* @return {Function} the event listener
*/
function createFollowCursorListener(tippy) {
  var listener = function listener(e) {
    if (tippy._lastTriggerEvent === 'focus') return;

    var popper = tippy.popper,
        offset = tippy.options.offset;


    var placement = getPopperPlacement(popper);
    var halfPopperWidth = Math.round(popper.offsetWidth / 2);
    var halfPopperHeight = Math.round(popper.offsetHeight / 2);
    var viewportPadding = 5;
    var pageWidth = document.documentElement.offsetWidth || document.body.offsetWidth;

    var pageX = e.pageX,
        pageY = e.pageY;


    var x = void 0,
        y = void 0;

    switch (placement) {
      case 'top':
        x = pageX - halfPopperWidth + offset;
        y = pageY - 2 * halfPopperHeight;
        break;
      case 'bottom':
        x = pageX - halfPopperWidth + offset;
        y = pageY + 10;
        break;
      case 'left':
        x = pageX - 2 * halfPopperWidth;
        y = pageY - halfPopperHeight + offset;
        break;
      case 'right':
        x = pageX + 5;
        y = pageY - halfPopperHeight + offset;
        break;
    }

    var isRightOverflowing = pageX + viewportPadding + halfPopperWidth + offset > pageWidth;
    var isLeftOverflowing = pageX - viewportPadding - halfPopperWidth + offset < 0;

    // Prevent left/right overflow
    if (placement === 'top' || placement === 'bottom') {
      if (isRightOverflowing) {
        x = pageWidth - viewportPadding - 2 * halfPopperWidth;
      }

      if (isLeftOverflowing) {
        x = viewportPadding;
      }
    }

    popper.style[prefix('transform')] = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  };

  tippy._followCursorListener = listener;

  return listener;
}

/**
* Appends the popper and creates a popper instance if one does not exist
* Also updates its position if need be and enables event listeners
* @param {Tippy} tippy
*/
function mountPopper(tippy) {
  var popper = tippy.popper,
      reference = tippy.reference,
      _tippy$options = tippy.options,
      appendTo = _tippy$options.appendTo,
      followCursor = _tippy$options.followCursor;

  // Already on the DOM

  if (appendTo.contains(popper)) return;

  appendTo.appendChild(popper);

  if (!tippy.popperInstance) {
    tippy.popperInstance = createPopperInstance(tippy);
  } else {
    tippy.popperInstance.update();

    if (!followCursor || browser.usingTouch) {
      tippy.popperInstance.enableEventListeners();
    }
  }

  // Since touch is determined dynamically, followCursor is set on mount
  if (followCursor && !browser.usingTouch) {
    document.addEventListener('mousemove', createFollowCursorListener(tippy));
    tippy.popperInstance.disableEventListeners();
  }
}

/**
* Updates a popper's position on each animation frame to make it stick to a moving element
* @param {Tippy} tippy
*/
function makeSticky(tippy) {
  var applyTransitionDuration = function applyTransitionDuration() {
    tippy.popper.style[prefix('transitionDuration')] = tippy.options.updateDuration + 'ms';
  };

  var removeTransitionDuration = function removeTransitionDuration() {
    tippy.popper.style[prefix('transitionDuration')] = '';
  };

  var updatePosition = function updatePosition() {
    tippy.popperInstance && tippy.popperInstance.scheduleUpdate();

    applyTransitionDuration();

    isVisible(tippy.popper) ? requestAnimationFrame(updatePosition) : removeTransitionDuration();
  };

  // Wait until Popper's position has been updated initially
  defer(updatePosition);
}

/**
* Prepares the callback functions for `show` and `hide` methods
* @param {Tippy} tippy
* @param {Number} duration
* @param {Function} callback - callback function to fire once transition completes
*/
function onTransitionEnd(tippy, duration, callback) {
  // Make callback synchronous if duration is 0
  if (!duration) {
    return callback();
  }

  var _getInnerElements = getInnerElements(tippy.popper),
      tooltip = _getInnerElements.tooltip;

  var toggleListeners = function toggleListeners(action, listener) {
    if (!listener) return;
    tooltip[action + 'EventListener']('webkitTransitionEnd', listener);
    tooltip[action + 'EventListener']('transitionend', listener);
  };

  var listener = function listener(e) {
    if (e.target === tooltip) {
      toggleListeners('remove', listener);
      callback();
    }
  };

  toggleListeners('remove', tippy._transitionendListener);
  toggleListeners('add', listener);

  tippy._transitionendListener = listener;
}

/**
* Determines if an element is visible in the viewport
* @param {Element} el
* @return {Boolean}
*/
function elementIsInViewport(el) {
  var rect = el.getBoundingClientRect();

  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

/**
* Returns duration taking into account the option being either a number or array
* @param {Number} duration
* @param {Number} index
* @return {Number}
*/
function getDuration(duration, index) {
  return Array.isArray(duration) ? duration[index] : duration;
}

/**
* Sets the visibility state of an element for transition to begin
* @param {Element[]} els - array of elements
* @param {String} type - 'visible' or 'hidden'
*/
function setVisibilityState(els, type) {
  els.forEach(function (el) {
    if (!el) return;
    el.setAttribute('data-state', type);
  });
}

/**
* Applies the transition duration to each element
* @param {Element[]} els - Array of elements
* @param {Number} duration
*/
function applyTransitionDuration(els, duration) {
  els.forEach(function (el) {
    if (!el) return;

    var isContent = matches$1.call(el, selectors.CONTENT);
    var _duration = isContent ? Math.round(duration / 1.3) : duration;

    el.style[prefix('transitionDuration')] = _duration + 'ms';
  });
}

var Tippy = function () {
  function Tippy(config) {
    classCallCheck(this, Tippy);

    for (var prop in config) {
      this[prop] = config[prop];
    }
    this.state = {
      destroyed: false
    };
  }

  /**
  * Shows the tooltip
  * @param {Number} duration in milliseconds
  */


  createClass(Tippy, [{
    key: 'show',
    value: function show(duration) {
      var _this = this;

      if (this.state.destroyed) return;

      var popper = this.popper,
          reference = this.reference,
          options = this.options;

      var _getInnerElements = getInnerElements(popper),
          tooltip = _getInnerElements.tooltip,
          backdrop = _getInnerElements.backdrop,
          content = _getInnerElements.content;

      // Destroy tooltip if the reference element is no longer on the DOM


      if (!reference.refObj && !document.body.contains(reference)) {
        this.destroy();
        return;
      }

      options.onShow.call(popper);

      duration = getDuration(duration !== undefined ? duration : options.duration, 0);

      // Prevent a transition when popper changes position
      applyTransitionDuration([popper, tooltip, backdrop], 0);

      mountPopper(this);

      popper.style.visibility = 'visible';
      popper.setAttribute('aria-hidden', 'false');

      // Wait for popper's position to update by deferring the callback, so
      // that the position update doesn't transition, only the normal animation
      defer(function () {
        // ~20ms can elapse before this defer callback is run, so the hide() method
        // may have been invoked -- check if the popper is still visible and cancel
        // this callback if not
        if (!isVisible(popper)) return;

        if (!options.followCursor) {
          // The arrow is sometimes not in the correct position, so another update after mount is required
          // May be a bug with Popper.js
          _this.popperInstance.update();
          applyTransitionDuration([popper], options.updateDuration);
        }

        // Re-apply transition durations
        applyTransitionDuration([tooltip, backdrop], duration);

        // Make content fade out a bit faster than the tooltip if `animateFill` is true
        if (backdrop) {
          content.style.opacity = 1;
        }

        if (options.interactive) {
          reference.classList.add('tippy-active');
        }

        if (options.sticky) {
          makeSticky(_this);
        }

        setVisibilityState([tooltip, backdrop], 'visible');

        onTransitionEnd(_this, duration, function () {
          if (isVisible(popper)) {
            options.interactive && popper.focus();
            options.onShown.call(popper);
          }
        });
      });
    }

    /**
    * Hides the tooltip
    * @param {Number} duration in milliseconds
    */

  }, {
    key: 'hide',
    value: function hide(duration) {
      var _this2 = this;

      if (this.state.destroyed) return;

      var popper = this.popper,
          reference = this.reference,
          options = this.options;

      var _getInnerElements2 = getInnerElements(popper),
          tooltip = _getInnerElements2.tooltip,
          backdrop = _getInnerElements2.backdrop,
          content = _getInnerElements2.content;

      options.onHide.call(popper);

      duration = getDuration(duration !== undefined ? duration : options.duration, 1);

      if (options.interactive) {
        reference.classList.remove('tippy-active');
      }

      popper.style.visibility = 'hidden';
      popper.setAttribute('aria-hidden', 'true');

      applyTransitionDuration([tooltip, backdrop, backdrop ? content : null], duration);

      if (backdrop) {
        content.style.opacity = 0;
      }

      setVisibilityState([tooltip, backdrop], 'hidden');

      if (options.interactive && options.trigger.indexOf('click') > -1 && elementIsInViewport(reference)) {
        reference.focus();
      }

      onTransitionEnd(this, duration, function () {
        // `isVisible` is not completely reliable to determine if we shouldn't
        // run the hidden callback, we need to check the computed opacity style.
        // This prevents glitchy behavior of the transition when quickly showing
        // and hiding a tooltip.
        if (!isVisible(popper) && options.appendTo.contains(popper) && getComputedStyle(tooltip).opacity !== '1') {
          document.removeEventListener('mousemove', _this2._followCursorListener);
          _this2.popperInstance.disableEventListeners();
          options.appendTo.removeChild(popper);

          options.onHidden.call(popper);
        }
      });
    }

    /**
    * Destroys the tooltip
    */

  }, {
    key: 'destroy',
    value: function destroy() {
      var _this3 = this;

      if (this.state.destroyed) return;

      // Ensure the popper is hidden
      if (isVisible(this.popper)) {
        this.hide(0);
      }

      this.listeners.forEach(function (listener) {
        _this3.reference.removeEventListener(listener.event, listener.handler);
      });

      // Restore title
      this.reference.setAttribute('title', this.reference.getAttribute('data-original-title'));

      delete this.reference._tippy;['data-original-title', 'data-tippy', 'aria-describedby'].forEach(function (attr) {
        _this3.reference.removeAttribute(attr);
      });

      if (this.popperInstance) {
        this.popperInstance.destroy();
      }

      this._mutationObservers.forEach(function (observer) {
        observer.disconnect();
      });

      this.state.destroyed = true;
    }
  }]);
  return Tippy;
}();

var idCounter = 1;

/**
* Creates tooltips for each reference element
* @param {Element[]} els
* @param {Object} config
* @return {Tippy[]} Array of Tippy instances
*/
function createTooltips(els, config) {
  return els.reduce(function (acc, reference) {
    var id = idCounter;

    var options = evaluateOptions(reference, config.performance ? config : getIndividualOptions(reference, config));

    var html = options.html,
        trigger = options.trigger,
        touchHold = options.touchHold,
        dynamicTitle = options.dynamicTitle,
        createPopperInstanceOnInit = options.createPopperInstanceOnInit;


    var title = reference.getAttribute('title');
    if (!title && !html) return acc;

    reference.setAttribute('data-tippy', '');
    reference.setAttribute('aria-describedby', 'tippy-' + id);

    removeTitle(reference);

    var popper = createPopperElement(id, title, options);

    var tippy = new Tippy({
      id: id,
      reference: reference,
      popper: popper,
      options: options,
      _mutationObservers: []
    });

    tippy.popperInstance = createPopperInstanceOnInit ? createPopperInstance(tippy) : null;

    var listeners = getEventListeners(tippy, options);
    tippy.listeners = trigger.trim().split(' ').reduce(function (acc, eventType) {
      return acc.concat(createTrigger(eventType, reference, listeners, touchHold));
    }, []);

    // Update tooltip content whenever the title attribute on the reference changes
    if (dynamicTitle) {
      addMutationObserver({
        tippy: tippy,
        target: reference,
        callback: function callback() {
          var _getInnerElements = getInnerElements(popper),
              content = _getInnerElements.content;

          var title = reference.getAttribute('title');
          if (title) {
            content.innerHTML = title;
            removeTitle(reference);
          }
        },

        options: {
          attributes: true
        }
      });
    }

    // Shortcuts
    reference._tippy = tippy;
    popper._reference = reference;

    acc.push(tippy);

    idCounter++;

    return acc;
  }, []);
}

/**
* Hides all poppers
* @param {Tippy} excludeTippy - tippy to exclude if needed
*/
function hideAllPoppers(excludeTippy) {
  var poppers = [].slice.call(document.querySelectorAll(selectors.POPPER));

  poppers.forEach(function (popper) {
    var tippy = popper._reference._tippy;
    var options = tippy.options;


    if ((options.hideOnClick === true || options.trigger.indexOf('focus') > -1) && (!excludeTippy || popper !== excludeTippy.popper)) {
      tippy.hide();
    }
  });
}

/**
* Adds the needed event listeners
*/
function bindEventListeners() {
  var touchHandler = function touchHandler() {
    browser.usingTouch = true;

    if (browser.iOS) {
      document.body.classList.add('tippy-touch');
    }

    if (browser.dynamicInputDetection && window.performance) {
      document.addEventListener('mousemove', mousemoveHandler);
    }
  };

  var mousemoveHandler = function () {
    var time = void 0;

    return function () {
      var now = performance.now();

      // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
      if (now - time < 20) {
        browser.usingTouch = false;
        document.removeEventListener('mousemove', mousemoveHandler);
        if (!browser.iOS) {
          document.body.classList.remove('tippy-touch');
        }
      }

      time = now;
    };
  }();

  var clickHandler = function clickHandler(event) {
    // Simulated events dispatched on the document
    if (!(event.target instanceof Element)) {
      return hideAllPoppers();
    }

    var reference = closest(event.target, selectors.REFERENCE);
    var popper = closest(event.target, selectors.POPPER);

    if (popper && popper._reference._tippy.options.interactive) return;

    if (reference) {
      var options = reference._tippy.options;

      // Hide all poppers except the one belonging to the element that was clicked IF
      // `multiple` is false AND they are a touch user, OR
      // `multiple` is false AND it's triggered by a click

      if (!options.multiple && browser.usingTouch || !options.multiple && options.trigger.indexOf('click') > -1) {
        return hideAllPoppers(reference._tippy);
      }

      if (options.hideOnClick !== true || options.trigger.indexOf('click') > -1) return;
    }

    // Don't needlessly run loop if no poppers are on the document
    if (!document.querySelector(selectors.POPPER)) return;

    hideAllPoppers();
  };

  var blurHandler = function blurHandler(event) {
    var _document = document,
        el = _document.activeElement;

    if (el && el.blur && matches$1.call(el, selectors.REFERENCE)) {
      el.blur();
    }
  };

  document.addEventListener('click', clickHandler);
  document.addEventListener('touchstart', touchHandler);
  window.addEventListener('blur', blurHandler);

  if (!browser.supportsTouch && (navigator.maxTouchPoints || navigator.msMaxTouchPoints)) {
    document.addEventListener('pointerdown', touchHandler);
  }
}

/**
* Instantiates tooltips
* @param {String|Element|Element[]|NodeList|Object} selector
* @param {Object} options
* @return {Object}
*/
function tippy$2(selector, options) {
  if (browser.supported && !browser.eventsBound) {
    bindEventListeners();
    browser.eventsBound = true;
  }

  if (isObjectLiteral(selector)) {
    selector.refObj = true;
    selector.attributes = selector.attributes || {};
    selector.setAttribute = function (key, val) {
      selector.attributes[key] = val;
    };
    selector.getAttribute = function (key) {
      return selector.attributes[key];
    };
    selector.removeAttribute = function (key) {
      delete selector.attributes[key];
    };
    selector.addEventListener = function () {};
    selector.removeEventListener = function () {};
    selector.classList = {
      classNames: {},
      add: function add(key) {
        return selector.classList.classNames[key] = true;
      },
      remove: function remove(key) {
        delete selector.classList.classNames[key];
        return true;
      },
      contains: function contains(key) {
        return !!selector.classList.classNames[key];
      }
    };
  }

  options = _extends({}, defaults, options);

  return {
    selector: selector,
    options: options,
    tooltips: browser.supported ? createTooltips(getArrayOfElements(selector), options) : [],
    destroyAll: function destroyAll() {
      this.tooltips.forEach(function (tooltip) {
        return tooltip.destroy();
      });
    }
  };
}

tippy$2.browser = browser;
tippy$2.defaults = defaults;

return tippy$2;

})));
