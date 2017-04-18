(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Tippy = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var popper = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { 'use strict';

const nativeHints = ['native code', '[object MutationObserverConstructor]'];

/**
 * Determine if a function is implemented natively (as opposed to a polyfill).
 * @argument {Function | undefined} fn the function to check
 * @returns {boolean}
 */
var isNative = (fn => nativeHints.some(hint => (fn || '').toString().indexOf(hint) > -1));

const isBrowser = typeof window !== 'undefined';
const longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
let timeoutDuration = 0;
for (let i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  let scheduled = false;
  let i = 0;
  const elem = document.createElement('span');

  // MutationObserver provides a mechanism for scheduling microtasks, which
  // are scheduled *before* the next task. This gives us a way to debounce
  // a function but ensure it's called *before* the next paint.
  const observer = new MutationObserver(() => {
    fn();
    scheduled = false;
  });

  observer.observe(elem, { attributes: true });

  return () => {
    if (!scheduled) {
      scheduled = true;
      elem.setAttribute('x-index', i);
      i = i + 1; // don't use compund (+=) because it doesn't get optimized in V8
    }
  };
}

function taskDebounce(fn) {
  let scheduled = false;
  return () => {
    if (!scheduled) {
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

// It's common for MutationObserver polyfills to be seen in the wild, however
// these rely on Mutation Events which only occur when an element is connected
// to the DOM. The algorithm used in this module does not use a connected element,
// and so we must ensure that a *native* MutationObserver is available.
const supportsNativeMutationObserver = isBrowser && isNative(window.MutationObserver);

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsNativeMutationObserver ? microtaskDebounce : taskDebounce;

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles - Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(prop => {
    let unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase)
 */
function getSupportedPropertyName(property) {
  const prefixes = [false, 'ms', 'webkit', 'moz', 'o'];
  const upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (let i = 0; i < prefixes.length - 1; i++) {
    const prefix = prefixes[i];
    const toCheck = prefix ? `${prefix}${upperProp}` : property;
    if (typeof window.document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

function isOffsetContainer(element) {
  const { nodeName } = element;
  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || element.firstElementChild.offsetParent === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  // NOTE: 1 DOM access here
  const offsetParent = element && element.offsetParent;
  const nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return window.document.documentElement;
  }

  return offsetParent;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return window.document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  const order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  const start = order ? element1 : element2;
  const end = order ? element2 : element1;

  // Get common ancestor container
  const range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  const { commonAncestorContainer } = range;

  // Both nodes are inside #document
  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  const element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  const css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {Number} amount of scrolled pixels
 */
function getScroll(element, side = 'top') {
  const upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  const nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    const html = window.document.documentElement;
    const scrollingElement = window.document.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element, subtract = false) {
  const scrollTop = getScroll(element, 'top');
  const scrollLeft = getScroll(element, 'left');
  const modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element || ['HTML', 'BODY', '#document'].indexOf(element.nodeName) !== -1) {
    return window.document.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well
  const { overflow, overflowX, overflowY } = getStyleComputedProperty(element);
  if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles - result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {Number} borders - the borders size of the given axis
 */

function getBordersSize(styles, axis) {
  const sideA = axis === 'x' ? 'Left' : 'Top';
  const sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return +styles[`border${sideA}Width`].split('px')[0] + +styles[`border${sideB}Width`].split('px')[0];
}

function getWindowSizes() {
  const body = window.document.body;
  const html = window.document.documentElement;
  return {
    height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
    width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)
  };
}

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
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Tells if you are running Internet Explorer 10
 * @returns {Boolean} isIE10
 */
var runIsIE10 = function () {
  return navigator.appVersion.indexOf('MSIE 10') !== -1;
};

const isIE10$1 = runIsIE10();

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  let rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  if (isIE10$1) {
    try {
      rect = element.getBoundingClientRect();
    } catch (err) {}
    const scrollTop = getScroll(element, 'top');
    const scrollLeft = getScroll(element, 'left');
    rect.top += scrollTop;
    rect.left += scrollLeft;
  } else {
    rect = element.getBoundingClientRect();
  }

  const result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  const sizes = element.nodeName === 'HTML' ? getWindowSizes() : {};
  const width = sizes.width || element.clientWidth || result.right - result.left;
  const height = sizes.height || element.clientHeight || result.bottom - result.top;

  let horizScrollbar = element.offsetWidth - width;
  let vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    const styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

const isIE10 = runIsIE10();

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  const isHTML = parent.nodeName === 'HTML';
  const childrenRect = getBoundingClientRect(children);
  const parentRect = getBoundingClientRect(parent);
  const scrollParent = getScrollParent(children);
  let offsets = getClientRect({
    top: childrenRect.top - parentRect.top,
    left: childrenRect.left - parentRect.left,
    width: childrenRect.width,
    height: childrenRect.height
  });

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (isHTML || parent.nodeName === 'BODY') {
    const styles = getStyleComputedProperty(parent);
    const borderTopWidth = isIE10 && isHTML ? 0 : +styles.borderTopWidth.split('px')[0];
    const borderLeftWidth = isIE10 && isHTML ? 0 : +styles.borderLeftWidth.split('px')[0];
    const marginTop = isIE10 && isHTML ? 0 : +styles.marginTop.split('px')[0];
    const marginLeft = isIE10 && isHTML ? 0 : +styles.marginLeft.split('px')[0];

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (parent.contains(scrollParent) && (isIE10 || scrollParent.nodeName !== 'BODY')) {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  const commonOffsetParent = findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  const styles = window.getComputedStyle(element);
  const x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  const y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
  const result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one/
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  const hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, matched => hash[matched]);
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(position, popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  const popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  const popperOffsets = {
    position,
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  const isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  const mainSide = isHoriz ? 'top' : 'left';
  const secondarySide = isHoriz ? 'left' : 'top';
  const measurement = isHoriz ? 'height' : 'width';
  const secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {*} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  const getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  const isBody = scrollParent.nodeName === 'BODY';
  const target = isBody ? window : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  window.addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  const scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  window.removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(target => {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(cur => cur[prop] === value);
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  const match = find(arr, obj => obj[prop] === value);
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order, each of them will then edit the data object
 * @method
 * @memberof Popper.Utils
 * @param {Object} data
 * @param {Array} modifiers
 * @param {Function} ends
 */
function runModifiers(modifiers, data, ends) {
  const modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(modifier => {
    if (modifier.enabled && isFunction(modifier.function)) {
      data = modifier.function(data, modifier);
    }
  });

  return data;
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(({ name, enabled }) => enabled && name === modifierName);
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  const html = window.document.documentElement;
  const relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  const width = Math.max(html.clientWidth, window.innerWidth || 0);
  const height = Math.max(html.clientHeight, window.innerHeight || 0);

  const scrollTop = getScroll(html);
  const scrollLeft = getScroll(html, 'left');

  const offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width,
    height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  const nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  return isFixed(getParentNode(element));
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {Object} data - Object containing the property "offsets" generated by `_getOffsets`
 * @param {Number} padding - Boundaries padding
 * @param {Element} boundariesElement - Element used to define the boundaries
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  // NOTE: 1 DOM access here
  let boundaries = { top: 0, left: 0 };
  const offsetParent = findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent);
  } else {
    // Handle other cases based on DOM element used as boundaries
    let boundariesNode;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(popper));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = window.document.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = window.document.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    const offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      const { height, width } = getWindowSizes();
      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  boundaries.left += padding;
  boundaries.top += padding;
  boundaries.right -= padding;
  boundaries.bottom -= padding;

  return boundaries;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference) {
  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  const boundaries = getBoundaries(popper, reference, 0, 'scrollParent');

  const sides = {
    top: refRect.top - boundaries.top,
    right: boundaries.right - refRect.right,
    bottom: boundaries.bottom - refRect.bottom,
    left: refRect.left - boundaries.left
  };

  const computedPlacement = Object.keys(sides).sort((a, b) => sides[b] - sides[a])[0];
  const variation = placement.split('-')[1];

  return computedPlacement + (variation ? `-${variation}` : '');
}

const placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles - Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    const value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * Apply the computed styles to the popper element
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data, options) {
  // apply the final offsets to the popper
  // NOTE: 1 DOM access here
  const styles = {
    position: data.offsets.popper.position
  };

  const attributes = {
    'x-placement': data.placement
  };

  // round top and left to avoid blurry text
  const left = Math.round(data.offsets.popper.left);
  const top = Math.round(data.offsets.popper.top);

  // if gpuAcceleration is set to true and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  const prefixedProperty = getSupportedPropertyName('transform');
  if (options.gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles.top = 0;
    styles.left = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `left` and `top` properties
    styles.left = left;
    styles.top = top;
    styles.willChange = 'top, left';
  }

  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, _extends({}, styles, data.styles));

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, _extends({}, attributes, data.attributes));

  // if the arrow style has been computed, apply the arrow style
  if (data.offsets.arrow) {
    setStyles(data.arrowElement, data.offsets.arrow);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used to add margins to the popper
 * margins needs to be calculated to get the correct popper offsets
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper.
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  const referenceOffsets = getReferenceOffsets(state, popper, reference);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  options.placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference);

  popper.setAttribute('x-placement', options.placement);
  return options;
}

/**
 * Helper used to know if the given modifier depends from another one.
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  const requesting = find(modifiers, ({ name }) => name === requestingName);

  return !!requesting && modifiers.some(modifier => {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });
}

/**
 * Modifier used to move the arrowElements on the edge of the popper to make sure them are always between the popper and the reference element
 * It will use the CSS outer size of the arrowElement element to know how many pixels of conjuction are needed
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    console.warn('WARNING: `keepTogether` modifier is required by arrow modifier in order to work, be sure to include it before `arrow`!');
    return data;
  }

  let arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  const placement = data.placement.split('-')[0];
  const popper = getClientRect(data.offsets.popper);
  const reference = data.offsets.reference;
  const isVertical = ['left', 'right'].indexOf(placement) !== -1;

  const len = isVertical ? 'height' : 'width';
  const side = isVertical ? 'top' : 'left';
  const altSide = isVertical ? 'left' : 'top';
  const opSide = isVertical ? 'bottom' : 'right';
  const arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its reference have enough pixels in conjuction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }

  // compute center of the popper
  const center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  let sideValue = center - getClientRect(data.offsets.popper)[side];

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = {};
  data.offsets.arrow[side] = sideValue;
  data.offsets.arrow[altSide] = ''; // make sure to unset any eventual altSide value from the DOM node

  return data;
}

/**
 * Get the opposite placement variation of the given one/
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

// Get rid of `auto` `auto-start` and `auto-end`
const validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement, counter = false) {
  const index = validPlacements.indexOf(placement);
  const arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

const BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * Modifier used to flip the placement of the popper when the latter is starting overlapping its reference element.
 * Requires the `preventOverflow` modifier before it in order to work.
 * **NOTE:** data.instance modifier will run all its previous modifiers everytime it tries to flip the popper!
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  const boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement);

  let placement = data.placement.split('-')[0];
  let placementOpposite = getOppositePlacement(placement);
  let variation = data.placement.split('-')[1] || '';

  let flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach((step, index) => {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    const popperOffsets = getClientRect(data.offsets.popper);
    const refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    const floor = Math.floor;
    const overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    const overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    const overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    const overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    const overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    const overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    const isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    const flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');
      data.offsets.popper = getPopperOffsets(data.instance.state.position, data.instance.popper, data.offsets.reference, data.placement);

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * Modifier used to make sure the popper is always near its reference element
 * It cares only about the first axis, you can still have poppers with margin
 * between the popper and its reference element.
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  const popper = getClientRect(data.offsets.popper);
  const reference = data.offsets.reference;
  const placement = data.placement.split('-')[0];
  const floor = Math.floor;
  const isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  const side = isVertical ? 'right' : 'bottom';
  const opSide = isVertical ? 'left' : 'top';
  const measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Modifier used to add an offset to the popper, useful if you more granularity positioning your popper.
 * The offsets will shift the popper on the side of its reference element.
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 *      Basic usage allows a number used to nudge the popper by the given amount of pixels.
 *      You can pass a percentage value as string (eg. `20%`) to nudge by the given percentage (relative to reference element size)
 *      Other supported units are `vh` and `vw` (relative to viewport)
 *      Additionally, you can pass a pair of values (eg. `10 20` or `2vh 20%`) to nudge the popper
 *      on both axis.
 *      A note about percentage values, if you want to refer a percentage to the popper size instead of the reference element size,
 *      use `%p` instead of `%` (eg: `20%p`). To make it clearer, you can replace `%` with `%r` and use eg.`10%p 25%r`.
 *      > **Heads up!** The order of the axis is relative to the popper placement: `bottom` or `top` are `X,Y`, the other are `Y,X`
 * @returns {Object} The data object, properly modified
 */
function offset(data, options) {
  const placement = data.placement;
  const popper = data.offsets.popper;

  let offsets;
  if (isNumeric(options.offset)) {
    offsets = [options.offset, 0];
  } else {
    // split the offset in case we are providing a pair of offsets separated
    // by a blank space
    offsets = options.offset.split(' ');

    // itherate through each offset to compute them in case they are percentages
    offsets = offsets.map((offset, index) => {
      // separate value from unit
      const split = offset.match(/(\d*\.?\d*)(.*)/);
      const value = +split[1];
      const unit = split[2];

      // use height if placement is left or right and index is 0 otherwise use width
      // in this way the first offset will use an axis and the second one
      // will use the other one
      let useHeight = placement.indexOf('right') !== -1 || placement.indexOf('left') !== -1;

      if (index === 1) {
        useHeight = !useHeight;
      }

      const measurement = useHeight ? 'height' : 'width';

      // if is a percentage relative to the popper (%p), we calculate the value of it using
      // as base the sizes of the popper
      // if is a percentage (% or %r), we calculate the value of it using as base the
      // sizes of the reference element
      if (unit.indexOf('%') === 0) {
        let element;
        switch (unit) {
          case '%p':
            element = data.offsets.popper;
            break;
          case '%':
          case '$r':
          default:
            element = data.offsets.reference;
        }

        const rect = getClientRect(element);
        const len = rect[measurement];
        return len / 100 * value;
      } else if (unit === 'vh' || unit === 'vw') {
        // if is a vh or vw, we calculate the size based on the viewport
        let size;
        if (unit === 'vh') {
          size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        } else {
          size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        }
        return size / 100 * value;
      } else if (unit === 'px') {
        // if is an explicit pixel unit, we get rid of the unit and keep the value
        return +value;
      } else {
        // if is an implicit unit, it's px, and we return just the value
        return +offset;
      }
    });
  }

  if (data.placement.indexOf('left') !== -1) {
    popper.top += offsets[0];
    popper.left -= offsets[1] || 0;
  } else if (data.placement.indexOf('right') !== -1) {
    popper.top += offsets[0];
    popper.left += offsets[1] || 0;
  } else if (data.placement.indexOf('top') !== -1) {
    popper.left += offsets[0];
    popper.top -= offsets[1] || 0;
  } else if (data.placement.indexOf('bottom') !== -1) {
    popper.left += offsets[0];
    popper.top += offsets[1] || 0;
  }
  return data;
}

/**
 * Modifier used to prevent the popper from being positioned outside the boundary.
 *
 * An scenario exists where the reference itself is not within the boundaries. We can
 * say it has "escaped the boundaries" — or just "escaped". In this case we need to
 * decide whether the popper should either:
 *
 * - detach from the reference and remain "trapped" in the boundaries, or
 * - if it should be ignore the boundary and "escape with the reference"
 *
 * When `escapeWithReference` is `true`, and reference is completely outside the
 * boundaries, the popper will overflow (or completely leave) the boundaries in order
 * to remain attached to the edge of the reference.
 *
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  const boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);
  const boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement);
  options.boundaries = boundaries;

  const order = options.priority;
  let popper = getClientRect(data.offsets.popper);

  const check = {
    primary(placement) {
      let value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return { [placement]: value };
    },
    secondary(placement) {
      const mainSide = placement === 'right' ? 'left' : 'top';
      let value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return { [mainSide]: value };
    }
  };

  order.forEach(placement => {
    const side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * Modifier used to shift the popper on the start or end of its reference element side
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  const placement = data.placement;
  const basePlacement = placement.split('-')[0];
  const shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    const reference = data.offsets.reference;
    const popper = getClientRect(data.offsets.popper);
    const isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    const side = isVertical ? 'left' : 'top';
    const measurement = isVertical ? 'width' : 'height';

    const shiftOffsets = {
      start: { [side]: reference[side] },
      end: {
        [side]: reference[side] + reference[measurement] - popper[measurement]
      }
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * Modifier used to hide the popper when its reference element is outside of the
 * popper boundaries. It will set an x-hidden attribute which can be used to hide
 * the popper when its reference is out of boundaries.
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    console.warn('WARNING: preventOverflow modifier is required by hide modifier in order to work, be sure to include it before hide!');
    return data;
  }

  const refRect = data.offsets.reference;
  const bound = find(data.instance.modifiers, modifier => modifier.name === 'preventOverflow').boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * Modifier used to make the popper flow toward the inner of the reference element.
 * By default, when this modifier is disabled, the popper will be placed outside
 * the reference element.
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  const placement = data.placement;
  const basePlacement = placement.split('-')[0];
  const popper = getClientRect(data.offsets.popper);
  const reference = getClientRect(data.offsets.reference);
  const isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  const subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[placement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifiers are plugins used to alter the behavior of your poppers.
 * Popper.js uses a set of 7 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Each modifier is an object containing several properties listed below.
 * @namespace Modifiers
 * @param {Object} modifier - Modifier descriptor
 * @param {Integer} modifier.order
 *      The `order` property defines the execution order of the modifiers.
 *      The built-in modifiers have orders with a gap of 100 units in between,
 *      this allows you to inject additional modifiers between the existing ones
 *      without having to redefine the order of all of them.
 *      The modifiers are executed starting from the one with the lowest order.
 * @param {Boolean} modifier.enabled - When `true`, the modifier will be used.
 * @param {Modifiers~modifier} modifier.function - Modifier function.
 * @param {Modifiers~onLoad} modifier.onLoad - Function executed on popper initalization
 * @return {Object} data - Each modifier must return the modified `data` object.
 */
var modifiers = {
  shift: {
    order: 100,
    enabled: true,
    function: shift
  },
  offset: {
    order: 200,
    enabled: true,
    function: offset,
    // nudges popper from its origin by the given amount of pixels (can be negative)
    offset: 0
  },
  preventOverflow: {
    order: 300,
    enabled: true,
    function: preventOverflow,
    // popper will try to prevent overflow following these priorities
    //  by default, then, it could overflow on the left and on top of the boundariesElement
    priority: ['left', 'right', 'top', 'bottom'],
    // amount of pixel used to define a minimum distance between the boundaries and the popper
    // this makes sure the popper has always a little padding between the edges of its container
    padding: 5,
    boundariesElement: 'scrollParent'
  },
  keepTogether: {
    order: 400,
    enabled: true,
    function: keepTogether
  },
  arrow: {
    order: 500,
    enabled: true,
    function: arrow,
    // selector or node used as arrow
    element: '[x-arrow]'
  },
  flip: {
    order: 600,
    enabled: true,
    function: flip,
    // the behavior used to change the popper's placement
    behavior: 'flip',
    // the popper will flip if it hits the edges of the boundariesElement - padding
    padding: 5,
    boundariesElement: 'viewport'
  },
  inner: {
    order: 700,
    enabled: false,
    function: inner
  },
  hide: {
    order: 800,
    enabled: true,
    function: hide
  },
  applyStyle: {
    order: 900,
    enabled: true,
    // if true, it uses the CSS 3d transformation to position the popper
    gpuAcceleration: true,
    function: applyStyle,
    onLoad: applyStyleOnLoad
  }
};

/**
  * Modifiers can edit the `data` object to change the beheavior of the popper.
  * This object contains all the informations used by Popper.js to compute the
  * popper position.
  * The modifier can edit the data as needed, and then `return` it as result.
  *
  * @callback Modifiers~modifier
  * @param {dataObject} data
  * @return {dataObject} modified data
  */

/**
  * The `dataObject` is an object containing all the informations used by Popper.js
  * this object get passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
  * @name dataObject
  * @property {Object} data.instance The Popper.js instance
  * @property {String} data.placement Placement applied to popper
  * @property {String} data.originalPlacement Placement originally defined on init
  * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
  * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper.
  * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
  * @property {Object} data.styles Any CSS property defined here will be applied to the popper, it expects the JavaScript nomenclature (eg. `marginBottom`)
  * @property {Object} data.boundaries Offsets of the popper boundaries
  * @property {Object} data.offsets The measurements of popper, reference and arrow elements.
  * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
  * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
  * @property {Object} data.offsets.arro] `top` and `left` offsets, only one of them will be different from 0
  */

// Utils
// Modifiers
// default options
const DEFAULTS = {
  // placement of the popper
  placement: 'bottom',

  // whether events (resize, scroll) are initially enabled
  eventsEnabled: true,

  /**
     * Callback called when the popper is created.
     * By default, is set to no-op.
     * Access Popper.js instance with `data.instance`.
     * @callback createCallback
     * @static
     * @param {dataObject} data
     */
  onCreate: () => {},

  /**
     * Callback called when the popper is updated, this callback is not called
     * on the initialization/creation of the popper, but only on subsequent
     * updates.
     * By default, is set to no-op.
     * Access Popper.js instance with `data.instance`.
     * @callback updateCallback
     * @static
     * @param {dataObject} data
     */
  onUpdate: () => {},

  // list of functions used to modify the offsets before they are applied to the popper
  modifiers
};

/**
 * Create a new Popper.js instance
 * @class Popper
 * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper.
 * @param {Object} options
 * @param {String} options.placement=bottom
 *      Placement of the popper accepted values: `top(-start, -end), right(-start, -end), bottom(-start, -end),
 *      left(-start, -end)`
 *
 * @param {Boolean} options.eventsEnabled=true
 *      Whether events (resize, scroll) are initially enabled
 * @param {Boolean} options.gpuAcceleration=true
 *      When this property is set to true, the popper position will be applied using CSS3 translate3d, allowing the
 *      browser to use the GPU to accelerate the rendering.
 *      If set to false, the popper will be placed using `top` and `left` properties, not using the GPU.
 *
 * @param {Boolean} options.removeOnDestroy=false
 *      Set to true if you want to automatically remove the popper when you call the `destroy` method.
 *
 * @param {Object} options.modifiers
 *      List of functions used to modify the data before they are applied to the popper (see source code for default values)
 *
 * @param {Object} options.modifiers.arrow - Arrow modifier configuration
 * @param {String|HTMLElement} options.modifiers.arrow.element='[x-arrow]'
 *      The DOM Node used as arrow for the popper, or a CSS selector used to get the DOM node. It must be child of
 *      its parent Popper. Popper.js will apply to the given element the style required to align the arrow with its
 *      reference element.
 *      By default, it will look for a child node of the popper with the `x-arrow` attribute.
 *
 * @param {Object} options.modifiers.offset - Offset modifier configuration
 * @param {Number} options.modifiers.offset.offset=0
 *      Amount of pixels the popper will be shifted (can be negative).
 *
 * @param {Object} options.modifiers.preventOverflow - PreventOverflow modifier configuration
 * @param {Array} [options.modifiers.preventOverflow.priority=['left', 'right', 'top', 'bottom']]
 *      Priority used when Popper.js tries to avoid overflows from the boundaries, they will be checked in order,
 *      this means that the last one will never overflow
 * @param {String|HTMLElement} options.modifiers.preventOverflow.boundariesElement='scrollParent'
 *      Boundaries used by the modifier, can be `scrollParent`, `window`, `viewport` or any DOM element.
 * @param {Number} options.modifiers.preventOverflow.padding=5
 *      Amount of pixels used to define a minimum distance between the boundaries and the popper
 *      this makes sure the popper has always a little padding between the edges of its container.
 *
 * @param {Object} options.modifiers.flip - Flip modifier configuration
 * @param {String|Array} options.modifiers.flip.behavior='flip'
 *      The behavior used by the `flip` modifier to change the placement of the popper when the latter is trying to
 *      overlap its reference element. Defining `flip` as value, the placement will be flipped on
 *      its axis (`right - left`, `top - bottom`).
 *      You can even pass an array of placements (eg: `['right', 'left', 'top']` ) to manually specify
 *      how alter the placement when a flip is needed. (eg. in the above example, it would first flip from right to left,
 *      then, if even in its new placement, the popper is overlapping its reference element, it will be moved to top)
 * @param {String|HTMLElement} options.modifiers.flip.boundariesElement='viewport'
 *      The element which will define the boundaries of the popper position, the popper will never be placed outside
 *      of the defined boundaries (except if `keepTogether` is enabled)
 *
 * @param {Object} options.modifiers.inner - Inner modifier configuration
 * @param {Number} options.modifiers.inner.enabled=false
 *      Set to `true` to make the popper flow toward the inner of the reference element.
 *
 * @param {Number} options.modifiers.flip.padding=5
 *      Amount of pixels used to define a minimum distance between the boundaries and the popper
 *      this makes sure the popper will flip before it touches the edge of the boundaries,
 *      making it have always a little padding between the edges of its container.
 *
 * @param {createCallback} options.onCreate - onCreate callback
 *      Function called after the Popper has been instantiated.
 *
 * @param {updateCallback} options.onUpdate - onUpdate callback
 *      Function called on subsequent updates of Popper.
 *
 * @return {Object} instance - The generated Popper.js instance
 */
class Popper {
  constructor(reference, popper, options = {}) {
    this.scheduleUpdate = () => requestAnimationFrame(this.update);

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference.jquery ? reference[0] : reference;
    this.popper = popper.jquery ? popper[0] : popper;

    // make sure to apply the popper position before any computation
    setStyles(this.popper, { position: 'absolute' });

    // refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(Popper.Defaults.modifiers).map(name => _extends({
      name
    }, Popper.Defaults.modifiers[name]));

    // assign default values to modifiers, making sure to override them with
    // the ones defined by user
    this.modifiers = this.modifiers.map(defaultConfig => {
      const userConfig = options.modifiers && options.modifiers[defaultConfig.name] || {};
      return _extends({}, defaultConfig, userConfig);
    });

    // add custom modifiers to the modifiers list
    if (options.modifiers) {
      this.options.modifiers = _extends({}, Popper.Defaults.modifiers, options.modifiers);
      Object.keys(options.modifiers).forEach(name => {
        // take in account only custom modifiers
        if (Popper.Defaults.modifiers[name] === undefined) {
          const modifier = options.modifiers[name];
          modifier.name = name;
          this.modifiers.push(modifier);
        }
      });
    }

    // sort the modifiers by order
    this.modifiers = this.modifiers.sort((a, b) => a.order - b.order);

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(modifierOptions => {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(this.reference, this.popper, this.options, modifierOptions, this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    const eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  //
  // Methods
  //

  /**
     * Updates the position of the popper, computing the new offsets and applying the new style
     * Prefer `scheduleUpdate` over `update` because of performance reasons
     * @method
     * @memberof Popper
     */
  update() {
    // if popper is destroyed, don't perform any further update
    if (this.state.isDestroyed) {
      return;
    }

    let data = {
      instance: this,
      styles: {},
      attributes: {},
      flipped: false,
      offsets: {}
    };

    // compute reference element offsets
    data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference);

    // store the computed placement inside `originalPlacement`
    data.originalPlacement = this.options.placement;

    // compute the popper offsets
    data.offsets.popper = getPopperOffsets(this.state, this.popper, data.offsets.reference, data.placement);

    // run the modifiers
    data = runModifiers(this.modifiers, data);

    // the first `update` will call `onCreate` callback
    // the other ones will call `onUpdate` callback
    if (!this.state.isCreated) {
      this.state.isCreated = true;
      this.options.onCreate(data);
    } else {
      this.options.onUpdate(data);
    }
  }

  /**
     * Schedule an update, it will run on the next UI update available
     * @method scheduleUpdate
     * @memberof Popper
     */


  /**
     * Destroy the popper
     * @method
     * @memberof Popper
     */
  destroy() {
    this.state.isDestroyed = true;

    // touch DOM only if `applyStyle` modifier is enabled
    if (isModifierEnabled(this.modifiers, 'applyStyle')) {
      this.popper.removeAttribute('x-placement');
      this.popper.style.left = '';
      this.popper.style.position = '';
      this.popper.style.top = '';
      this.popper.style[getSupportedPropertyName('transform')] = '';
    }

    this.disableEventListeners();

    // remove the popper if user explicity asked for the deletion on destroy
    // do not use `remove` because IE11 doesn't support it
    if (this.options.removeOnDestroy) {
      this.popper.parentNode.removeChild(this.popper);
    }
    return this;
  }

  /**
     * it will add resize/scroll events and start recalculating
     * position of the popper element when they are triggered
     * @method
     * @memberof Popper
     */
  enableEventListeners() {
    if (!this.state.eventsEnabled) {
      this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
    }
  }

  /**
     * it will remove resize/scroll events and won't recalculate
     * popper position when they are triggered. It also won't trigger onUpdate callback anymore,
     * unless you call 'update' method manually.
     * @method
     * @memberof Popper
     */
  disableEventListeners() {
    if (this.state.eventsEnabled) {
      window.cancelAnimationFrame(this.scheduleUpdate);
      this.state = removeEventListeners(this.reference, this.state);
    }
  }

  /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     * @memberof Popper
     */


  /**
     * List of accepted placements to use as values of the `placement` option
     * @memberof Popper
     */


  /**
     * Default Popper.js options
     * @memberof Popper
     */
}

/**
  * The `referenceObject` is an object that provides an interface compatible with Popper.js
  * and lets you use it as replacement of a real DOM node.
  * You can use this method to position a popper relatively to a set of coordinates
  * in case you don't have a DOM node to use as reference.
  * NB: This feature isn't supported in Internet Explorer 10
  * @name referenceObject
  * @property {Function} data.getBoundingClientRect A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
  * @property {Number} data.clientWidth An ES6 getter that will return the width of the virtual reference element.
  * @property {Number} data.clientHeight An ES6 getter that will return the height of the virtual reference element.
  */

Popper.Utils = window.PopperUtils;
Popper.placements = placements;
Popper.Defaults = DEFAULTS;

return Popper;

})));
//# sourceMappingURL=popper.js.map
});

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

/**!
* @file tippy.js | Pure JS Tooltip Library
* @version 0.5.0
* @license MIT
*/

// Touch user is assumed false until a `touchstart` event listener is fired
var touchUser = false;

// Storage object to hold all references from instance instantiation
// Allows us to hide tooltips from other instances when clicking on the body
var store = {
    refs: [],
    els: [],
    poppers: []
};

var DEFAULTS = {
    html: false,
    position: 'top',
    animation: 'shift',
    animateFill: true,
    arrow: false,
    delay: 0,
    trigger: 'mouseenter focus',
    duration: 400,
    hideDuration: 400,
    interactive: false,
    theme: 'dark',
    offset: 0,
    hideOnClick: true,
    multiple: false,
    followCursor: false,
    inertia: false,
    popperOptions: {}
};

var elementSelectors = {
    popper: '.tippy-popper',
    tooltip: '.tippy-tooltip',
    content: '.tippy-tooltip-content',
    circle: '[x-circle]',
    arrow: '[x-arrow]',
    el: '[data-tooltipped]',
    controller: '[data-tippy-controller]'
};

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
        if (typeof window.document.body.style[prefixedProp] !== 'undefined') {
            return prefixedProp;
        }
    }

    return null;
}

/**
* Polyfill to get the closest parent element
* @param {Element} element - child of parent to be returned
* @param {String} parentSelector - selector to match the parent if found
* @return {Element}
*/
function closest(element, parentSelector) {
    if (!Element.prototype.matches) {
        if (element.matchesSelector) {
            Element.prototype.matches = Element.prototype.matchesSelector;
        } else if (element.webkitMatchesSelector) {
            Element.prototype.matches = Element.prototype.webkitMatchesSelector;
        } else if (element.mozMatchesSelector) {
            Element.prototype.matches = Element.prototype.mozMatchesSelector;
        } else if (element.msMatchesSelector) {
            Element.prototype.matches = Element.prototype.msMatchesSelector;
        } else {
            return element;
        }
    }
    if (!Element.prototype.closest) Element.prototype.closest = function (selector) {
        var el = this;
        while (el) {
            if (el.matches(selector)) {
                return el;
            }
            el = el.parentElement;
        }
    };
    return element.closest(parentSelector);
}

/**
* Creates a new popper instance
* @param {Element} el
* @param {Element} popper
* @param {Object} settings
* @return {Object} - the popper instance
*/
function createPopperInstance(el, popper$$1, settings) {
    var config = _extends({
        placement: settings.position
    }, settings.popperOptions || {}, {
        modifiers: _extends({}, settings.popperOptions ? settings.popperOptions.modifiers : {}, {
            flip: _extends({
                padding: 15
            }, settings.popperOptions && settings.popperOptions.modifiers ? settings.popperOptions.modifiers.flip : {}),
            offset: _extends({
                offset: parseInt(settings.offset)
            }, settings.popperOptions && settings.popperOptions.modifiers ? settings.popperOptions.modifiers.offset : {})
        })
    });

    // Temporarily append popper for Popper.js
    document.body.appendChild(popper$$1);

    var instance = new popper(el, popper$$1, config);
    instance.disableEventListeners();

    document.body.removeChild(popper$$1);

    return instance;
}

/**
* Creates a popper element then returns it
* @param {String} title - the tooltip's `title` attribute
* @param {Object} settings - individual settings
* @return {Element} - the popper element
*/
function createPopperElement(title, settings) {
    var popper$$1 = document.createElement('div');
    popper$$1.setAttribute('class', 'tippy-popper');

    // Fix for iOS animateFill
    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
        popper$$1.classList.add('tippy-iOS-fix');
    }

    var tooltip = document.createElement('div');
    tooltip.setAttribute('class', 'tippy-tooltip ' + settings.theme + ' leave');
    tooltip.setAttribute('data-animation', settings.animation);

    if (settings.arrow) {
        // Add an arrow
        var arrow = document.createElement('div');
        arrow.setAttribute('x-arrow', '');
        tooltip.appendChild(arrow);
    }

    if (settings.animateFill) {
        // Create animateFill circle element for animation
        tooltip.setAttribute('data-animatefill', '');
        var circle = document.createElement('div');
        circle.setAttribute('class', 'leave');
        circle.setAttribute('x-circle', '');
        tooltip.appendChild(circle);
    }

    if (settings.inertia) {
        // Change transition timing function cubic bezier
        tooltip.setAttribute('data-inertia', '');
    }

    // Tooltip content (text or HTML)
    var content = document.createElement('div');
    content.setAttribute('class', 'tippy-tooltip-content');

    if (settings.html) {

        var templateId = void 0;

        if (settings.html instanceof Element) {
            content.innerHTML = settings.html.innerHTML;
            templateId = settings.html.id || 'tippy-html-template';
        } else {
            content.innerHTML = document.getElementById(settings.html.replace('#', '')).innerHTML;
            templateId = settings.html;
        }

        popper$$1.classList.add('html-template');
        popper$$1.setAttribute('tabindex', '0');
        tooltip.setAttribute('data-template-id', templateId);
    } else {
        content.innerHTML = title;
    }

    tooltip.appendChild(content);
    popper$$1.appendChild(tooltip);

    return popper$$1;
}

/**
* Creates a trigger for each one specified
* @param {Object} event - the custom event specified in the `trigger` setting
* @param {Element} el
* @param {Object} methods - the methods for each listener
* @return {Array} - array of listener objects
*/
function createTrigger(event, el, methods) {
    if (event === 'manual') return;

    var listeners = [];

    // Enter
    el.addEventListener(event, methods.handleTrigger);
    listeners.push({
        event: event,
        method: methods.handleTrigger
    });

    // Leave
    if (event === 'mouseenter') {
        el.addEventListener('mouseleave', methods.handleMouseleave);
        listeners.push({
            event: 'mouseleave',
            method: methods.handleMouseleave
        });
    }
    if (event === 'focus') {
        el.addEventListener('blur', methods.handleBlur);
        listeners.push({
            event: 'blur',
            method: methods.handleBlur
        });
    }

    return listeners;
}

/**
* Adds each reference (tooltipped element, popper and its settings/listeners etc)
* into global storage
* @param {Object} ref - current ref in the forEach loop to be pushed
*/
function pushIntoStorage(ref) {
    store.refs.push(ref);
    store.els.push(ref.el);
    store.poppers.push(ref.popper);
}

/**
* Removes the title from the tooltipped element
* @param {Element} el
*/
function removeTitle(el) {
    var title = el.getAttribute('title');
    el.setAttribute('data-original-title', title || 'html');
    el.removeAttribute('title');
}

/**
* Mousemove event listener callback method for follow cursor setting
* @param {Object} e (event)
*/
function followCursor(e) {
    var ref = store.refs[store.els.indexOf(this)];
    var position = ref.popper.getAttribute('x-placement');
    var offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    var halfPopperWidth = Math.round(ref.popper.offsetWidth / 2);
    var halfPopperHeight = Math.round(ref.popper.offsetHeight / 2);

    // Default = top
    var x = e.clientX - halfPopperWidth;
    var y = e.clientY + offset - 50;

    if (position === 'left') {
        x = e.clientX - 2 * halfPopperWidth - 10;
        y = e.clientY + offset - halfPopperHeight;
    } else if (position === 'right') {
        x = e.clientX + 15;
        y = e.clientY + offset - halfPopperHeight;
    } else if (position === 'bottom') {
        y = e.clientY + offset + 15;
    }

    ref.popper.style[prefix('transform')] = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
}

/**
* Returns a global settings object to be applied to a Tippy instance
* @param {Object} - settings
* @return {Object}
*/
function applyGlobalSettings(settings) {
    // Object.assign polyfill
    if (typeof Object.assign != 'function') {
        Object.assign = function (target, varArgs) {
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // Object.assign mutates our default settings, so copy it
    return Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), settings);
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
* The class to be exported to be used on the `window`
* Private methods are prefixed with an underscore _
* @param {String} || {Element} selector
* @param {Object} settings (optional) - the object of settings to be applied to the instance
*/

var Tippy$1 = function () {
    function Tippy(selector) {
        var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, Tippy);


        // Use default browser tooltip on old browsers (IE < 10) and Opera Mini
        if (!('addEventListener' in window) || /MSIE 9/i.test(navigator.userAgent) || window.operamini) return;

        this.settings = applyGlobalSettings(settings);

        this.callbacks = {
            wait: settings.wait,
            beforeShown: settings.beforeShown || new Function(),
            shown: settings.shown || new Function(),
            beforeHidden: settings.beforeHidden || new Function(),
            hidden: settings.hidden || new Function()
        };

        // Check if selector is a DOM element
        this.els = selector instanceof Element ? [selector] : [].slice.call(document.querySelectorAll(selector));

        this._createTooltips();
        this._handleDocumentEvents();
    }

    /**
    * Returns an object of settings to override global settings
    * @param {Element} el - the tooltipped element
    * @return {Object} - individual settings
    */


    createClass(Tippy, [{
        key: '_applyIndividualSettings',
        value: function _applyIndividualSettings(el) {
            // Some falsy values require more verbose defining

            // false, 'false', or a template id
            var html = el.getAttribute('data-html') || this.settings.html;
            if (!html || html === 'false') html = false;

            // 'top', 'bottom', 'left', 'right'
            var position = el.getAttribute('data-position') || this.settings.position;

            // 'shift', 'perspective', 'scale', 'fade'
            var animation = el.getAttribute('data-animation') || this.settings.animation;

            // 'true', true, 'false', false
            var animateFill = el.getAttribute('data-animatefill') || this.settings.animateFill;
            if (animateFill === 'false') animateFill = false;

            // 'true', true, 'false', false
            var arrow = el.getAttribute('data-arrow') || this.settings.arrow;
            if (!arrow || arrow === 'false') arrow = false;else animateFill = false;

            // 'mouseenter focus' string to array
            var trigger = el.getAttribute('data-trigger') || this.settings.trigger;
            if (trigger) trigger = trigger.trim().split(' ');

            // 'dark', 'light', '{custom}'
            var theme = el.getAttribute('data-theme') || this.settings.theme;
            if (theme) theme += '-theme';

            // 0, '0'
            var delay = parseInt(el.getAttribute('data-delay'));
            if (!delay && delay !== 0) delay = this.settings.delay;

            // 0, '0'
            var duration = parseInt(el.getAttribute('data-duration'));
            if (!duration && duration !== 0) duration = this.settings.duration;

            // 0, '0'
            var hideDuration = parseInt(el.getAttribute('data-hideduration'));
            if (!hideDuration && hideDuration !== 0) hideDuration = this.settings.hideDuration;

            // 'true', true, 'false', false
            var interactive = el.getAttribute('data-interactive') || this.settings.interactive;
            if (interactive === 'false') interactive = false;

            // '0', 0
            var offset = parseInt(el.getAttribute('data-offset'));
            if (!offset && offset !== 0) offset = this.settings.offset;

            // 'true', true, 'false', false
            var hideOnClick = el.getAttribute('data-hideonclick') || this.settings.hideOnClick;
            if (hideOnClick === 'false') hideOnClick = false;

            // 'true', true, 'false', false
            var multiple = el.getAttribute('data-multiple') || this.settings.multiple;
            if (multiple === 'false') multiple = false;

            // 'true', true, 'false', false
            var followCursor = el.getAttribute('data-followcursor') || this.settings.followCursor;
            if (followCursor === 'false') followCursor = false;

            // 'true', true, 'false', false
            var inertia = el.getAttribute('data-inertia') || this.settings.inertia;
            if (inertia === 'false') inertia = false;

            // just take the provided value
            var popperOptions = this.settings.popperOptions;

            return {
                html: html,
                position: position,
                animation: animation,
                animateFill: animateFill,
                arrow: arrow,
                delay: delay,
                trigger: trigger,
                duration: duration,
                hideDuration: hideDuration,
                interactive: interactive,
                theme: theme,
                offset: offset,
                hideOnClick: hideOnClick,
                multiple: multiple,
                followCursor: followCursor,
                inertia: inertia,
                popperOptions: popperOptions
            };
        }

        /**
        * Hides all poppers
        * @param {Object} - currentRef
        */

    }, {
        key: '_hideAllPoppers',
        value: function _hideAllPoppers(currentRef) {
            var _this = this;

            store.refs.forEach(function (ref) {
                // Don't hide already hidden ones
                if (!document.body.contains(ref.popper)) return;

                // hideOnClick can have the truthy value of 'persistent', so strict check is needed
                if (ref.settings.hideOnClick === true && (!currentRef || ref.popper !== currentRef.popper)) {
                    _this.hide(ref.popper, ref.settings.hideDuration);
                }
            });
        }

        /**
        * Creates listeners on the document for click and touch start (to determine touch users)
        * Only relevant by the first Tippy instance that is created
        */

    }, {
        key: '_handleDocumentEvents',
        value: function _handleDocumentEvents() {
            var _this2 = this;

            var handleClick = function handleClick(event) {

                var el = closest(event.target, elementSelectors.el);
                var popper$$1 = closest(event.target, elementSelectors.popper);

                if (popper$$1) {
                    var ref = store.refs[store.poppers.indexOf(popper$$1)];
                    if (ref.settings.interactive) return;
                }

                if (el) {
                    var _ref = store.refs[store.els.indexOf(el)];

                    // Hide all poppers except the one belonging to the element that was clicked IF
                    // `multiple` is false AND they are a touch user, OR
                    // `multiple` is false AND it's triggered by a click
                    if (!_ref.settings.multiple && touchUser || !_ref.settings.multiple && _ref.settings.trigger.indexOf('click') !== -1) {
                        return _this2._hideAllPoppers(_ref);
                    }

                    // If hideOnClick is not strictly true or triggered by a click don't hide poppers
                    if (_ref.settings.hideOnClick !== true || _ref.settings.trigger.indexOf('click') !== -1) return;
                }

                // Don't trigger a hide for tippy controllers
                if (!closest(event.target, elementSelectors.controller)) {
                    _this2._hideAllPoppers();
                }
            };

            var handleTouch = function handleTouch() {
                touchUser = true;
                document.body.classList.add('tippy-touch');
                document.removeEventListener('touchstart', handleTouch);
            };

            if (!store.listeners) {
                store.listeners = {
                    click: handleClick,
                    touchstart: handleTouch
                };
                document.addEventListener('click', handleClick);
                document.addEventListener('touchstart', handleTouch);
            }
        }

        /**
        * Returns relevant listener callback methods for each ref
        * @param {Element} el
        * @param {Element} popper
        * @param {Object} settings
        * @return {Object} - relevant listener callback methods
        */

    }, {
        key: '_getEventListenerMethods',
        value: function _getEventListenerMethods(el, popper$$1, settings) {
            var _this3 = this;

            // Avoid creating unnecessary timeouts
            var _show = function _show() {
                if (settings.delay) {
                    var delay = setTimeout(function () {
                        return _this3.show(popper$$1, settings.duration);
                    }, settings.delay);
                    popper$$1.setAttribute('data-delay', delay);
                } else {
                    _this3.show(popper$$1, settings.duration);
                }
            };

            var show = function show() {
                return _this3.callbacks.wait ? _this3.callbacks.wait(_show) : _show();
            };
            var hide = function hide() {
                return _this3.hide(popper$$1, settings.hideDuration);
            };

            var handleTrigger = function handleTrigger(event) {

                // Interactive tooltips receive a class of 'active'
                if (settings.interactive) {
                    event.target.classList.add('active');
                }

                // Toggle show/hide when clicking click-triggered tooltips
                if (event.type === 'click' && popper$$1.style.visibility === 'visible' && settings.hideOnClick !== 'persistent') {
                    return hide();
                }

                show();
            };

            var handleMouseleave = function handleMouseleave(event) {

                if (settings.interactive) {
                    // Temporarily handle mousemove to check if the mouse left somewhere
                    // other than its popper
                    var handleMousemove = function handleMousemove(event) {
                        // If cursor is NOT on the popper
                        // and it's NOT on the popper's tooltipped element
                        // and it's NOT triggered by a click, then hide
                        if (closest(event.target, elementSelectors.popper) !== popper$$1 && closest(event.target, elementSelectors.el) !== el && settings.trigger.indexOf('click') === -1) {
                            document.removeEventListener('mousemove', handleMousemove);
                            hide();
                        }
                    };
                    document.addEventListener('mousemove', handleMousemove);
                    return;
                }

                // If it's not interactive, just hide it
                hide();
            };

            var handleBlur = function handleBlur(event) {
                // Only hide if not a touch user and has a focus 'relatedtarget', of which is not
                // a popper element
                if (!touchUser && event.relatedTarget) {
                    if (!closest(event.relatedTarget, elementSelectors.popper)) {
                        hide();
                    }
                }
            };

            return {
                handleTrigger: handleTrigger,
                handleMouseleave: handleMouseleave,
                handleBlur: handleBlur
            };
        }

        /**
        * Creates tooltips for all elements that match the instance's selector
        */

    }, {
        key: '_createTooltips',
        value: function _createTooltips() {
            var _this4 = this;

            this.els.forEach(function (el) {

                el.setAttribute('data-tooltipped', '');

                var settings = _this4._applyIndividualSettings(el);

                var title = el.getAttribute('title');
                if (!title && !settings.html) return;

                removeTitle(el);

                var popper$$1 = createPopperElement(title, settings);
                var instance = createPopperInstance(el, popper$$1, settings);
                var methods = _this4._getEventListenerMethods(el, popper$$1, settings);
                var listeners = [];

                settings.trigger.forEach(function (event) {
                    listeners = listeners.concat(createTrigger(event, el, methods));
                });

                pushIntoStorage({
                    el: el,
                    popper: popper$$1,
                    settings: settings,
                    listeners: listeners,
                    instance: instance
                });
            });

            Tippy.store = store; // Allow others to access `store` if need be
        }

        /**
        * Fixes CSS transition when showing a flipped tooltip
        * @param {Object} ref - the popper/element reference
        * @param {Number} duration
        */

    }, {
        key: '_adjustFlip',
        value: function _adjustFlip(ref, duration) {
            var _this5 = this;

            var flipAdjust = function flipAdjust() {
                _this5.hide(ref.popper, 0, false);
                setTimeout(function () {
                    return _this5.show(ref.popper, duration, false);
                }, 0);
            };
            setTimeout(function () {
                var position = ref.popper.getAttribute('x-placement');

                if (!ref.adjusted && ref.settings.position !== position) {
                    ref.adjusted = true;
                    flipAdjust();
                } else if (ref.adjusted && ref.settings.position === position) {
                    ref.adjusted = false;
                    flipAdjust();
                }
            }, 0);
        }

        /**
        * Returns a tooltipped element's popper reference
        * @param {Element} el
        * @return {Element}
        */

    }, {
        key: 'getPopperElement',
        value: function getPopperElement(el) {
            try {
                return store.refs[store.els.indexOf(el)].popper;
            } catch (e) {
                throw new Error('[Tippy error]: Element does not exist in any Tippy instances');
            }
        }

        /**
        * Returns a popper's tooltipped element reference
        * @param {Element} popper
        * @return {Element}
        */

    }, {
        key: 'getTooltippedElement',
        value: function getTooltippedElement(popper$$1) {
            try {
                return store.refs[store.poppers.indexOf(popper$$1)].el;
            } catch (e) {
                throw new Error('[Tippy error]: Popper does not exist in any Tippy instances');
            }
        }

        /**
        * Shows a popper
        * @param {Element} popper
        * @param {Number} duration (optional)
        * @param {Boolean} enableCallback (optional)
        */

    }, {
        key: 'show',
        value: function show(popper$$1) {
            var _this6 = this;

            var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.settings.duration;
            var enableCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;


            // Already visible
            if (popper$$1.style.visibility === 'visible') return;

            var ref = store.refs[store.poppers.indexOf(popper$$1)];
            var tooltip = popper$$1.querySelector(elementSelectors.tooltip);
            var circle = popper$$1.querySelector(elementSelectors.circle);

            if (enableCallback) this.callbacks.beforeShown();

            document.body.appendChild(popper$$1);

            popper$$1.style.visibility = 'visible';

            // Follow cursor setting, not applicable to touch users
            if (ref.settings.followCursor && !touchUser) {
                if (!ref.hasFollowCursorListener) {
                    ref.hasFollowCursorListener = true;
                    ref.el.addEventListener('mousemove', followCursor);
                }
            } else {
                ref.instance.enableEventListeners();
            }

            ref.instance.update();

            this._adjustFlip(ref, duration);

            // Repaint is required for CSS transition when appending
            getComputedStyle(tooltip).opacity;

            tooltip.style[prefix('transitionDuration')] = duration + 'ms';
            tooltip.classList.add('enter');
            tooltip.classList.remove('leave');

            if (circle) {
                // Reflow
                getComputedStyle(circle)[prefix('transform')];

                circle.style[prefix('transitionDuration')] = duration + 'ms';
                circle.classList.add('enter');
                circle.classList.remove('leave');
            }

            var onShown = function onShown() {
                popper$$1.removeEventListener('webkitTransitionEnd', onShown);
                popper$$1.removeEventListener('transitionend', onShown);

                if (popper$$1.style.visibility === 'hidden' || ref.onShownFired) return;

                // Focus click triggered interactive tooltips (popovers) only
                if (ref.settings.interactive && ref.settings.trigger.indexOf('click') !== -1) {
                    popper$$1.focus();
                }

                ref.onShownFired = true;

                _this6.callbacks.shown();
            };

            if (duration < 20) {
                return onShown();
            }

            // Wait for transitions to complete
            popper$$1.addEventListener('webkitTransitionEnd', onShown);
            popper$$1.addEventListener('transitionend', onShown);
        }

        /**
        * Hides a popper
        * @param {Element} popper
        * @param {Number} duration (optional)
        * @param {Boolean} enableCallback (optional)
        */

    }, {
        key: 'hide',
        value: function hide(popper$$1) {
            var _this7 = this;

            var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.settings.duration;
            var enableCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            // Clear unwanted timeouts due to `delay` setting
            clearTimeout(popper$$1.getAttribute('data-delay'));

            // Hidden anyway
            if (!document.body.contains(popper$$1)) return;

            var ref = store.refs[store.poppers.indexOf(popper$$1)];
            var tooltip = popper$$1.querySelector(elementSelectors.tooltip);
            var circle = popper$$1.querySelector(elementSelectors.circle);

            if (enableCallback) {
                this.callbacks.beforeHidden();
                ref.el.classList.remove('active');
                ref.onShownFired = false;
            }

            popper$$1.style.visibility = 'hidden';

            // Use the same duration as the show if it's the default

            if (duration === DEFAULTS.hideDuration) {
                if (prefix('transitionDuration')) {
                    duration = parseInt(tooltip.style[prefix('transitionDuration')].replace('ms', ''));
                }
            } else {
                tooltip.style[prefix('transitionDuration')] = duration + 'ms';
                if (circle) circle.style[prefix('transitionDuration')] = duration + 'ms';
            }

            tooltip.classList.add('leave');
            tooltip.classList.remove('enter');
            if (circle) {
                circle.classList.add('leave');
                circle.classList.remove('enter');
            }

            // Re-focus tooltipped element if it's a HTML popover
            // and the tooltipped element IS in the viewport (otherwise it causes unsightly scrolling
            // if the tooltip is closed and the element isn't in the viewport anymore)
            if (ref.settings.html && ref.settings.trigger.indexOf('click') !== -1 && elementIsInViewport(ref.el)) {
                ref.el.focus();
            }

            var onHidden = function onHidden() {
                popper$$1.removeEventListener('webkitTransitionEnd', onHidden);
                popper$$1.removeEventListener('transitionend', onHidden);

                if (popper$$1.style.visibility === 'visible' || !document.body.contains(popper$$1)) return;

                // Follow cursor setting
                if (ref.hasFollowCursorListener) {
                    ref.el.removeEventListener('mousemove', followCursor);
                    ref.hasFollowCursorListener = false;
                }

                ref.instance.disableEventListeners();

                document.body.removeChild(popper$$1);

                if (enableCallback) _this7.callbacks.hidden();
            };

            if (duration < 20) {
                return onHidden();
            }

            // Wait for transitions to complete
            ref.onHidden = onHidden;

            popper$$1.addEventListener('webkitTransitionEnd', onHidden);
            popper$$1.addEventListener('transitionend', onHidden);
        }

        /**
        * Destroys a popper
        * @param {Element} popper
        */

    }, {
        key: 'destroy',
        value: function destroy(popper$$1) {
            var index = store.poppers.indexOf(popper$$1);
            var ref = store.refs[index];

            // Remove Tippy-only event listeners from tooltipped element
            ref.listeners.forEach(function (listener) {
                return ref.el.removeEventListener(listener.event, listener.method);
            });

            ref.el.removeAttribute('data-tooltipped');

            ref.instance.destroy();

            // Remove from storage
            store.refs.splice(index, 1);
            store.els.splice(index, 1);
            store.poppers.splice(index, 1);
        }

        /**
        * Updates a popper with new content
        * @param {Element} popper
        */

    }, {
        key: 'update',
        value: function update(popper$$1) {
            var ref = store.refs[store.poppers.indexOf(popper$$1)];
            var content = popper$$1.querySelector(elementSelectors.content);
            var template = ref.settings.html;

            if (template) {
                content.innerHTML = template instanceof Element ? template.innerHTML : document.getElementById(template.replace('#', '')).innerHTML;
            } else {
                content.innerHTML = ref.el.getAttribute('title') || ref.el.getAttribute('data-original-title');
                removeTitle(ref.el);
            }
        }
    }]);
    return Tippy;
}();

return Tippy$1;

})));
