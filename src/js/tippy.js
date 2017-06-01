import Popper from 'popper.js'

/**!
* @file tippy.js | Pure JS Tooltip Library
* @version 0.16.1
* @license MIT
*/

// Unsupported: IE<=9, Opera Mini
const IS_UNSUPPORTED_BROWSER = (typeof window !== 'undefined') && (
    !('addEventListener' in window) || 
    /MSIE 9/i.test(navigator.userAgent) || 
    typeof window.operamini !== 'undefined'
)

const STORE = []

const DEFAULTS = !IS_UNSUPPORTED_BROWSER && Object.freeze({
    html: false,
    position: 'top',
    animation: 'shift',
    animateFill: true,
    arrow: false,
    arrowSize: 'regular',
    delay: 0,
    hideDelay: 0,
    trigger: 'mouseenter focus',
    duration: 375,
    hideDuration: 375,
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
    flipDuration: 300,
    sticky: false,
    stickyDuration: 200,
    appendTo: (typeof document !== 'undefined') ? document.body : null,
    zIndex: 9999,
    popperOptions: {}
})

const DEFAULTS_KEYS = !IS_UNSUPPORTED_BROWSER && Object.keys(DEFAULTS)

const SELECTORS = {
    popper: '.tippy-popper',
    tooltip: '.tippy-tooltip',
    content: '.tippy-tooltip-content',
    circle: '[x-circle]',
    arrow: '[x-arrow]',
    el: '[data-tooltipped]',
    controller: '[data-tippy-controller]'
}

// Hook events only if rendered on a browser
if (!( typeof window === 'undefined' || typeof document === 'undefined' )) {
    if (!IS_UNSUPPORTED_BROWSER) {
        document.addEventListener('click', handleDocumentClick)
        document.addEventListener('touchstart', handleDocumentTouchstart)
    }
}

let touchDevice = false
let idCounter = 1

function handleDocumentTouchstart(event) {
    touchDevice = true

    // iOS needs cursor:pointer on elements which are non-clickable in order
    // to register both clicks and mouseenter events
    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && !window.MSStream) {
        document.body.classList.add('tippy-touch')
    }

    document.removeEventListener('touchstart', handleDocumentTouchstart)
}

// Handle clicks anywhere on the document
function handleDocumentClick(event) {

    const el = closest(event.target, SELECTORS.el)
    const popper = closest(event.target, SELECTORS.popper)
    
    if (popper) {
        const ref = find(STORE, ref => ref.popper === popper)
        const { settings: { interactive } } = ref
        if (interactive) return
    }

    if (el) {
        const ref = find(STORE, ref => ref.el === el)
        const { popper, settings: { hideOnClick, multiple, trigger } } = ref

        // If they clicked before the show() was to fire, clear it
        if (hideOnClick === true && !touchDevice) {
            clearTimeout(popper.getAttribute('data-delay'))
        }

        // Hide all poppers except the one belonging to the element that was clicked IF
        // `multiple` is false AND they are a touch user, OR
        // `multiple` is false AND it's triggered by a click
        if ((!multiple && touchDevice) || (!multiple && trigger.indexOf('click') !== -1)) {
            return hideAllPoppers(ref)
        }

        // If hideOnClick is not strictly true or triggered by a click don't hide poppers
        if (hideOnClick !== true || trigger.indexOf('click') !== -1) return
    }

    // Don't trigger a hide for tippy controllers, and don't needlessly run loop
    if (closest(event.target, SELECTORS.controller) ||
        !document.querySelector(SELECTORS.popper)
    ) return

    hideAllPoppers()
}

/**
* Returns the supported prefixed property - only `webkit` is needed, `moz`, `ms` and `o` are obsolete
* @param {String} property
* @return {String} - browser supported prefixed property
*/
function prefix(property) {
    const prefixes = [false, 'webkit']
    const upperProp = property.charAt(0).toUpperCase() + property.slice(1)

    for (var i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i]
        const prefixedProp = prefix ? '' + prefix + upperProp : property
        if (typeof window.document.body.style[prefixedProp] !== 'undefined') {
            return prefixedProp
        }
    }

    return null
}

/**
* Returns the non-shifted placement (e.g., 'bottom-start' => 'bottom')
* @param {String} placement
* @return {String}
*/
function getCorePlacement(placement) {
    return placement.replace(/-.+/, '')
}

/**
* Polyfill to get the closest parent element
* @param {Element} element - child of parent to be returned
* @param {String} parentSelector - selector to match the parent if found
* @return {Element}
*/
function closest(element, parentSelector) {
    if (!Element.prototype.matches) {
        Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
        }
    }
    if (!Element.prototype.closest) Element.prototype.closest = function(selector) {
        var el = this
        while (el) {
            if (el.matches(selector)) {
                return el
            }
            el = el.parentElement
        }
    }
    return element.closest(parentSelector)
}

/**
* Polyfill for Array.prototype.find
* @param {Array} arr
* @param {Function} checkFn
* @return item in the array
*/
function find(arr, checkFn) {
  if (Array.prototype.find) {
    return arr.find(checkFn)
  }

  // use `filter` as fallback
  return arr.filter(checkFn)[0]
}

/**
* Creates a new popper instance
* @param {Object} ref
* @return {Object} - the popper instance
*/
function createPopperInstance(ref) {

    const { 
        el, 
        popper,
        settings: { 
            position, 
            popperOptions, 
            offset, 
            distance 
        }
    } = ref

    const tooltip = popper.querySelector(SELECTORS.tooltip)

    const config = {
        placement: position,
        ...(popperOptions || {}),
        modifiers: {
            ...(popperOptions ? popperOptions.modifiers : {}),
            flip: {
                padding: distance + 5 /* 5px from viewport boundary */,
                ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {})
            },
            offset: {
                offset,
                ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {})
            }
        },
        onUpdate() {
            tooltip.style.top = ''
            tooltip.style.bottom = ''
            tooltip.style.left = ''
            tooltip.style.right = ''
            tooltip.style[getCorePlacement(popper.getAttribute('x-placement'))] = -(distance - DEFAULTS.distance) + 'px'
        }
    }

    return new Popper(el, popper, config)
}

/**
* Creates a popper element then returns it
* @param {Number} id - the popper id
* @param {String} title - the tooltip's `title` attribute
* @param {Object} settings - individual settings
* @return {Element} - the popper element
*/
function createPopperElement(id, title, settings) {
    
    const { 
        position, 
        distance, 
        arrow, 
        animateFill, 
        inertia, 
        animation, 
        arrowSize, 
        size, 
        theme, 
        html,
        zIndex
    } = settings
    
    const popper = document.createElement('div')
    popper.setAttribute('class', 'tippy-popper')
    popper.setAttribute('role', 'tooltip')
    popper.setAttribute('aria-hidden', 'true')
    popper.setAttribute('id', `tippy-tooltip-${id}`)
    popper.style.zIndex = zIndex

    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', `tippy-tooltip tippy-tooltip--${size} ${theme}-theme leave`)
    tooltip.setAttribute('data-animation', animation)

    if (arrow) {
        // Add an arrow
        const arrow = document.createElement('div')
        arrow.setAttribute('class', `arrow-${arrowSize}`)
        arrow.setAttribute('x-arrow', '')
        tooltip.appendChild(arrow)
    }

    if (animateFill) {
        // Create animateFill circle element for animation
        tooltip.setAttribute('data-animatefill', '')
        const circle = document.createElement('div')
        circle.setAttribute('class', 'leave')
        circle.setAttribute('x-circle', '')
        tooltip.appendChild(circle)
    }

    if (inertia) {
        // Change transition timing function cubic bezier
        tooltip.setAttribute('data-inertia', '')
    }

    // Tooltip content (text or HTML)
    const content = document.createElement('div')
    content.setAttribute('class', 'tippy-tooltip-content')

    if (html) {

        let templateId

        if (html instanceof Element) {
            content.innerHTML = html.innerHTML
            templateId = html.id || 'tippy-html-template'
        } else {
            content.innerHTML = document.getElementById(html.replace('#', '')).innerHTML
            templateId = html
        }

        popper.classList.add('html-template')
        popper.setAttribute('tabindex', '0')
        tooltip.setAttribute('data-template-id', templateId)

    } else {
        content.innerHTML = title
    }

    // Init distance. Further updates are made in the popper instance's `onUpdate()` method
    tooltip.style[getCorePlacement(position)] = -(distance - DEFAULTS.distance) + 'px'

    tooltip.appendChild(content)
    popper.appendChild(tooltip)

    return popper
}

/**
* Creates a trigger
* @param {Object} event - the custom event specified in the `trigger` setting
* @param {Element} el - tooltipped element
* @param {Object} handlers - the handlers for each listener
* @return {Array} - array of listener objects
*/
function createTrigger(event, el, handlers) {
    const listeners = []

    if (event === 'manual') return listeners

    // Enter
    el.addEventListener(event, handlers.handleTrigger)
    listeners.push({
        event,
        handler: handlers.handleTrigger
    })

    // Leave
    if (event === 'mouseenter') {
        el.addEventListener('mouseleave', handlers.handleMouseleave)
        listeners.push({
            event: 'mouseleave',
            handler: handlers.handleMouseleave
        })
    }
    if (event === 'focus') {
        el.addEventListener('blur', handlers.handleBlur)
        listeners.push({
            event: 'blur',
            handler: handlers.handleBlur
        })
    }

    return listeners
}

/**
* Adds each reference (tooltipped element, popper and its settings/listeners etc)
* into global storage
* @param {Object} ref - current ref in the forEach loop to be pushed
*/
function pushIntoStorage(ref) {
    STORE.push(ref)
}

/**
* Removes the title from the tooltipped element
* @param {Element} el
*/
function removeTitle(el) {
    const title = el.title
    el.setAttribute('data-original-title', title || 'html')
    el.removeAttribute('title')
}

/**
* Determines if an element is visible in the viewport
* @param {Element} el
* @return {Boolean}
*/
function elementIsInViewport(el) {
    const rect = el.getBoundingClientRect()

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

/**
* Mousemove event listener callback method for follow cursor setting
* @param {Event} e
*/
function followCursorHandler(e) {
    const ref = find(STORE, ref => ref.el === this)
    const { popper } = ref
    
    const position = getCorePlacement(popper.getAttribute('x-placement'))
    const halfPopperWidth = Math.round( popper.offsetWidth / 2 )
    const halfPopperHeight = Math.round( popper.offsetHeight / 2 )
    const viewportPadding = 5
    const pageWidth = document.documentElement.offsetWidth || document.body.offsetWidth
    
    const { pageX, pageY } = e
    
    let x, y

    if (position === 'top') {
        x = pageX - halfPopperWidth
        y = pageY - 2.5 * halfPopperHeight
    } else if (position === 'left') {
        x = pageX - ( 2 * halfPopperWidth ) - 15
        y = pageY - halfPopperHeight
    } else if (position === 'right') {
        x = pageX + halfPopperHeight
        y = pageY - halfPopperHeight
    } else if (position === 'bottom') {
        x = pageX - halfPopperWidth
        y = pageY + halfPopperHeight/1.5
    }
    
    // Prevent left/right overflow
    if (position === 'top' || position === 'bottom') {
        if (pageX + viewportPadding + halfPopperWidth > pageWidth) {
            // Right overflow
            x = pageWidth - viewportPadding - ( 2 * halfPopperWidth)
        } else if (pageX - viewportPadding - halfPopperWidth < 0) {
            // Left overflow
            x = viewportPadding
        }
    }

    popper.style[prefix('transform')] = `translate3d(${x}px, ${y}px, 0)`
}

/**
* Triggers a document repaint or reflow for CSS transition
* @param {Element} tooltip
* @param {Element} circle
*/
function triggerReflow(tooltip, circle) {
    // Safari needs the specific 'transform' property to be accessed
    circle ? window.getComputedStyle(circle)[prefix('transform')]
           : window.getComputedStyle(tooltip).opacity
}

/**
* Modifies elements' class lists
* @param {Array} els - HTML elements
* @param {Function} callback
*/
function modifyClassList(els, callback) {
    els.forEach(el => {
        if (!el) return
        callback(el.classList)
    })
}

/**
* Applies the transition duration to each element
* @param {Array} els - HTML elements
* @param {Number} duration
*/
function applyTransitionDuration(els, duration) {
    let mutableDuration = duration

    els.forEach(el => {
        if (!el) return

        mutableDuration = duration

        // Circle fill should be a bit quicker
        if (el.hasAttribute('x-circle')) {
            mutableDuration = Math.round(mutableDuration/1.2)
        }

        el.style[prefix('transitionDuration')] = mutableDuration + 'ms'
    })
}

/**
* Prepares the callback functions for `show` and `hide` methods
* @param {Object} ref -  the element/popper reference
* @param {Number} duration
* @param {Function} callback - callback function to fire once transitions complete
*/
function onTransitionEnd(ref, duration, callback) {

    const tooltip = ref.popper.querySelector(SELECTORS.tooltip)
    let transitionendFired = false

    const listenerCallback = e => {
        if (e.target !== tooltip) return

        transitionendFired = true

        tooltip.removeEventListener('webkitTransitionEnd', listenerCallback)
        tooltip.removeEventListener('transitionend', listenerCallback)

        callback()
    }

    // Wait for transitions to complete
    tooltip.addEventListener('webkitTransitionEnd', listenerCallback)
    tooltip.addEventListener('transitionend', listenerCallback)

    // transitionend listener sometimes may not fire
    clearTimeout(ref.transitionendTimeout)
    ref.transitionendTimeout = setTimeout(() => {
        !transitionendFired && callback()
    }, duration)
}

/**
* @param {Element} popper
* @param {String} type 'show'/'hide'
* @return {Boolean}
*/
function isExpectedState(popper, type) {
    return popper.style.visibility === type
}

/**
* Appends the popper and creates a popper instance if one does not exist
* Also updates its position if need be and enables event listeners
* @param {Object} ref -  the element/popper reference
*/
function mountPopper(ref) {
        
    const { 
        el, 
        popper, 
        settings: {
            appendTo,
            followCursor
        } 
    } = ref
    
    appendTo.appendChild(ref.popper)

    if (!ref.popperInstance) {
        // Create instance if it hasn't been created yet
        ref.popperInstance = createPopperInstance(ref)

        // Follow cursor setting
        if (followCursor && !touchDevice) {
            el.addEventListener('mousemove', followCursorHandler)
            ref.popperInstance.disableEventListeners()
        }
        
    } else {
        ref.popperInstance.update()
        !followCursor && ref.popperInstance.enableEventListeners()            
    }
}

/**
* Pushes execution of a function to end of execution queue, doing so
* just before repaint if possible
* @return {Function}
*     @param {Function} fn
*/
const queueExecution = (function() {
    let currentTimeoutQueue

    return function(fn) {
        clearTimeout(currentTimeoutQueue)

        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(() => {
                currentTimeoutQueue = setTimeout(fn, 0)
            })
        } else {
            currentTimeoutQueue = setTimeout(fn, 0)
        }
    }
})()

/**
* Updates a popper's position on each animation frame to make it stick to a moving element
* @param {Object} ref
*/
function makeSticky(ref) {

    const { 
        popper, 
        popperInstance, 
        settings: { 
            stickyDuration 
        } 
    } = ref

    const applyTransitionDuration = () => 
        popper.style[prefix('transitionDuration')] = `${stickyDuration}ms`
        
    const removeTransitionDuration = () => 
        popper.style[prefix('transitionDuration')] = ''

    const updatePosition = () => { 
        popperInstance && popperInstance.scheduleUpdate() 

        applyTransitionDuration()

        const isVisible = popper.style.visibility === 'visible'

        if (window.requestAnimationFrame) {
            isVisible ? window.requestAnimationFrame(updatePosition)
                      : removeTransitionDuration()
        } else {
            isVisible ? setTimeout(updatePosition, 20) 
                      : removeTransitionDuration()
        }
    }

    // Wait until Popper's position has been updated initially
    queueExecution(updatePosition)
}

/**
* Hides all poppers
* @param {Object} currentRef
*/
function hideAllPoppers(currentRef) {

    STORE.forEach(ref => {

        const { 
            popper, 
            tippyInstance, 
            settings: { 
                appendTo,
                hideOnClick, 
                hideDuration, 
                trigger
            } 
        } = ref

        // Don't hide already hidden ones
        if (!appendTo.contains(popper)) return

        // hideOnClick can have the truthy value of 'persistent', so strict check is needed
        const isHideOnClick = hideOnClick === true || trigger.indexOf('focus') !== -1
        const isNotCurrentRef = !currentRef || popper !== currentRef.popper

        if (isHideOnClick && isNotCurrentRef) {
            tippyInstance.hide(popper, hideDuration)
        }
    })
}

/**
* Returns an array of elements based on the selector input
* @param {String|Element} selector
* @return {Array} of HTML Elements
*/
function getSelectorElementsArray(selector) {
    if (selector instanceof Element) {
        return [selector]
    }
    
    return [].slice.call(document.querySelectorAll(selector))
}

/**
* Determines if the mouse's cursor is outside the interactive border
* @param {MouseEvent} event
* @param {Element} popper
* @param {Object} settings
* @return {Boolean}
*/
function cursorIsOutsideInteractiveBorder(event, popper, settings) {
    if (!popper.getAttribute('x-placement')) return false
    
    const { clientX: x, clientY: y } = event
    const { interactiveBorder, distance } = settings

    const rect = popper.getBoundingClientRect()
    const corePosition = getCorePlacement(popper.getAttribute('x-placement'))
    const borderWithDistance = interactiveBorder + distance

    let exceedsTop = rect.top - y > interactiveBorder
    let exceedsBottom = y - rect.bottom > interactiveBorder
    let exceedsLeft = rect.left - x > interactiveBorder
    let exceedsRight = x - rect.right > interactiveBorder
    
    if (corePosition === 'top') {
        exceedsTop = rect.top - y > borderWithDistance
    } else if (corePosition === 'bottom') {
        exceedsBottom = y - rect.bottom > borderWithDistance
    } else if (corePosition === 'left') {
        exceedsLeft = rect.left - x > borderWithDistance
    } else if (corePosition === 'right') {
        exceedsRight = x - rect.right > borderWithDistance
    }

    return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight
}

/**
* Private methods are prefixed with an underscore _
* @param {String|Element} selector
* @param {Object} settings (optional) - the object of settings to be applied to the instance
*/
class Tippy {
    constructor(selector, settings = {}) {

        // Use default browser tooltip on unsupported browsers.
        if (IS_UNSUPPORTED_BROWSER) return

        this.selector = selector
        this.settings = Object.freeze(Object.assign({}, DEFAULTS, settings))
        this.callbacks = {
            wait: settings.wait,
            beforeShown: settings.beforeShown || new Function,
            shown: settings.shown || new Function,
            beforeHidden: settings.beforeHidden || new Function,
            hidden: settings.hidden || new Function
        }
        
        const els = getSelectorElementsArray(selector)
        this._createTooltips(els)
    }

    /**
    * Returns an object of settings to override global settings
    * @param {Element} el - the tooltipped element
    * @return {Object} - individual settings
    */
    _applyIndividualSettings(el) {

        const settings = {}

        DEFAULTS_KEYS.forEach(key => {
            let val = el.getAttribute(`data-${ key.toLowerCase() }`) || this.settings[key]
            
            // Convert strings to booleans
            if (val === 'false') {
                val = false
            } else if (val === 'true') {
                val = true
            }
            // Convert number strings to true numbers
            if (!isNaN(parseFloat(val))) {
                val = parseFloat(val)
            }

            settings[key] = val
        })

        // animateFill is disabled if an arrow is true
        if (settings.arrow) {
            settings.animateFill = false
        }

        return Object.assign({}, this.settings, settings)
    }

    /**
    * Returns relevant listener callbacks for each ref
    * @param {Element} el
    * @param {Element} popper
    * @param {Object} settings
    * @return {Object} - relevant listener callback methods
    */
    _getEventListenerHandlers(el, popper, settings) {
        
        const { 
            position,
            delay, 
            hideDelay, 
            hideDuration, 
            duration, 
            interactive, 
            interactiveBorder, 
            distance,
            hideOnClick, 
            trigger 
        } = settings

        const clearTimeouts = () => {
            clearTimeout(popper.getAttribute('data-delay'))
            clearTimeout(popper.getAttribute('data-hidedelay'))
        }

        const _show = () => {
            clearTimeouts()

            // Already visible. For clicking when it also has a `focus` event listener
            if (popper.style.visibility === 'visible') return

            if (delay) {
                const timeout = setTimeout(() => this.show(popper, duration), delay)
                popper.setAttribute('data-delay', timeout)
            } else {
                this.show(popper, duration)
            }
        }

        const show = event => 
            this.callbacks.wait ? this.callbacks.wait.call(popper, _show, event) : _show()

        const hide = () => {
            clearTimeouts()

            if (hideDelay) {
                const timeout = setTimeout(() => this.hide(popper, hideDuration), hideDelay)
                popper.setAttribute('data-hidedelay', timeout)
            } else {
                this.hide(popper, hideDuration)
            }
        }

        const handleTrigger = event => {
            // Toggle show/hide when clicking click-triggered tooltips
            const isClick = event.type === 'click'
            const isVisible = popper.style.visibility === 'visible'
            const isNotPersistent = hideOnClick !== 'persistent'

            isClick && isVisible && isNotPersistent ? hide() : show(event)
        }

        const handleMouseleave = event => {
            
            if (interactive) {
                // Temporarily handle mousemove to check if the mouse left somewhere
                // other than its popper
                const handleMousemove = event => {
                    const triggerHide = () => {
                        document.removeEventListener('mousemove', handleMousemove)
                        hide()
                    }
                    
                    const closestTooltippedEl = closest(event.target, SELECTORS.el)
                    
                    const isOverPopper = closest(event.target, SELECTORS.popper) === popper
                    const isOverEl = closestTooltippedEl === el
                    const isClickTriggered = trigger.indexOf('click') !== -1
                    const isOverOtherTooltippedEl = closestTooltippedEl && closestTooltippedEl !== el
                    
                    if (isOverOtherTooltippedEl) {
                        return triggerHide()
                    }

                    if (isOverPopper || isOverEl || isClickTriggered) return

                    if (cursorIsOutsideInteractiveBorder(event, popper, settings)) {
                        triggerHide()
                    }
                }
                return document.addEventListener('mousemove', handleMousemove)
            }

            // If it's not interactive, just hide it
            hide()
        }

        const handleBlur = event => {
            // Only hide if not a touch user and has a focus 'relatedtarget', of which is not
            // a popper element
            if (touchDevice || !event.relatedTarget) return
            if (closest(event.relatedTarget, SELECTORS.popper)) return

            hide()
        }

        return {
            handleTrigger,
            handleMouseleave,
            handleBlur
        }
    }

    /**
    * Creates tooltips for all elements that match the instance's selector
    * @param {Array} els - Elements
    */
    _createTooltips(els) {

        els.forEach(el => {
            const settings = this._applyIndividualSettings(el)

            // If the script is in the <head> then document.body will be null
            settings.appendTo = settings.appendTo || document.body

            const { html, trigger } = settings

            const title = el.title
            if (!title && !html) return

            const id = idCounter
            el.setAttribute('data-tooltipped', '')
            el.setAttribute('aria-describedby', `tippy-tooltip-${id}`)

            removeTitle(el)

            const popper = createPopperElement(id, title, settings)
            const handlers = this._getEventListenerHandlers(el, popper, settings)
            let listeners = []

            trigger.trim().split(' ').forEach(
                event => listeners = listeners.concat(createTrigger(event, el, handlers))
            )

            pushIntoStorage({
                id,
                el,
                popper,
                settings,
                listeners,
                tippyInstance: this
            })

            idCounter++
        })

        Tippy.store = STORE // Allow others to access `STORE` if need be
    }

    /**
    * Returns a tooltipped element's popper reference
    * @param {Element} el
    * @return {Element}
    */
    getPopperElement(el) {
        try {
            return find(STORE, ref => ref.el === el).popper
        } catch (e) {
            throw new Error('[Tippy error]: Element does not exist in any Tippy instances')
        }
    }

    /**
    * Returns a popper's tooltipped element reference
    * @param {Element} popper
    * @return {Element}
    */
    getTooltippedElement(popper) {
        try {
            return find(STORE, ref => ref.popper === popper).el
        } catch (e) {
            throw new Error('[Tippy error]: Popper does not exist in any Tippy instances')
        }
    }
    
    /**
    * Returns the reference object from either the tooltipped element or popper element
    * @param {Element} x (tooltipped element or popper)
    * @return {Object}
    */
    getReference(x) {
        return find(STORE, ref => ref.el === x) ||
               find(STORE, ref => ref.popper === x)
    }

    /**
    * Shows a popper
    * @param {Element} popper
    * @param {Number} duration (optional)
    */
    show(popper, duration = this.settings.duration) {

        this.callbacks.beforeShown.call(popper)

        const ref = find(STORE, ref => ref.popper === popper)
        const tooltip = popper.querySelector(SELECTORS.tooltip)
        const circle = popper.querySelector(SELECTORS.circle)

        const {
            el,
            settings: {
                appendTo,
                sticky,
                interactive,
                followCursor,
                flipDuration
            }
        } = ref

        // Remove transition duration (prevent a transition when popper changes posiiton)
        applyTransitionDuration([popper, tooltip, circle], 0)

        // Mount popper to DOM if its container does not have it
        !appendTo.contains(popper) && mountPopper(ref)

        popper.style.visibility = 'visible'
        popper.setAttribute('aria-hidden', 'false')

        const onceUpdated = () => {
            if (!isExpectedState(popper, 'visible')) return

            // Sometimes the arrow will not be in the correct position,
            // force another update
            !followCursor && ref.popperInstance.update()

            // Re-apply transition durations
            applyTransitionDuration([tooltip, circle], duration)
            !followCursor && applyTransitionDuration([popper], flipDuration)

            // Interactive tooltips receive a class of 'active'
            interactive && el.classList.add('active')

            // Update popper's position on every animation frame
            sticky && makeSticky(ref)

            // Repaint/reflow is required for CSS transition when appending
            triggerReflow(tooltip, circle)

            modifyClassList([tooltip, circle], list => {
                list.contains('tippy-notransition') && list.remove('tippy-notransition')
                list.remove('leave')
                list.add('enter')
            })

            // Wait for transitions to complete
            onTransitionEnd(ref, duration, () => {
                if (!isExpectedState(popper, 'visible') || ref.onShownFired) return
                
                // Focus interactive tooltips only
                interactive && popper.focus()
                
                // Remove transitions from tooltip
                tooltip.classList.add('tippy-notransition')
                
                // Prevents shown() from firing more than once from early transition cancellations
                ref.onShownFired = true

                this.callbacks.shown.call(popper)
            })
        }

        // Wait for popper to update position and alter x-placement
        queueExecution(onceUpdated)
    }

    /**
    * Hides a popper
    * @param {Element} popper
    * @param {Number} duration (optional)
    */
    hide(popper, duration = this.settings.duration) {
        
        this.callbacks.beforeHidden.call(popper)

        const ref = find(STORE, ref => ref.popper === popper)
        const tooltip = popper.querySelector(SELECTORS.tooltip)
        const circle = popper.querySelector(SELECTORS.circle)
        const content = popper.querySelector(SELECTORS.content)

        const {
            el,
            settings: {
                appendTo,
                sticky,
                interactive,
                followCursor,
                html,
                trigger
            }
        } = ref

        ref.onShownFired = false
        interactive && el.classList.remove('active')

        popper.style.visibility = 'hidden'
        popper.setAttribute('aria-hidden', 'true')

        // Use same duration as show if it's the default
        if (duration === DEFAULTS.hideDuration) {
            duration = parseInt(tooltip.style[prefix('transitionDuration')])
        } else {
            applyTransitionDuration([tooltip, circle], duration)
        }

        modifyClassList([tooltip, circle], list => {
            list.contains('tippy-tooltip') && list.remove('tippy-notransition')
            list.remove('enter')
            list.add('leave')
        })

        // Re-focus click-triggered html elements
        // and the tooltipped element IS in the viewport (otherwise it causes unsightly scrolling
        // if the tooltip is closed and the element isn't in the viewport anymore)
        if (html && trigger.indexOf('click') !== -1 && elementIsInViewport(el)) {
            el.focus()
        }

        // Wait for transitions to complete
        onTransitionEnd(ref, duration, () => {
            if (!isExpectedState(popper, 'hidden') || !appendTo.contains(popper)) return

            ref.popperInstance.disableEventListeners()

            appendTo.removeChild(popper)

            this.callbacks.hidden.call(popper)
        })
    }

    /**
    * Destroys a popper
    * @param {Element} popper
    */
    destroy(popper) {
        const ref = find(STORE, ref => ref.popper === popper)
        const { el, popperInstance, listeners } = ref

        // Ensure the popper is hidden
        if (!isExpectedState(popper, 'hidden')) {
            this.hide(popper, 0)
        }

        // Remove Tippy-only event listeners from tooltipped element
        listeners.forEach(listener => el.removeEventListener(listener.event, listener.handler))

        el.removeAttribute('data-tooltipped')
        el.removeAttribute('aria-describedby')

        popperInstance && popperInstance.destroy()

        // Remove from storage
        STORE.splice(STORE.map(ref => ref.popper).indexOf(popper), 1)
    }

    /**
    * Updates a popper with new content
    * @param {Element} popper
    */
    update(popper) {
        const ref = find(STORE, ref => ref.popper === popper)
        const content = popper.querySelector(SELECTORS.content)
        const { el, settings: { html } } = ref

        if (html) {
            content.innerHTML = (html instanceof Element)
                                ? html.innerHTML
                                : document.getElementById(html.replace('#', '')).innerHTML
        } else {
            content.innerHTML = el.title || el.getAttribute('data-original-title')
            removeTitle(el)
        }
    }
}

export default function factory(selector, settings) {
    return new Tippy(selector, settings)
}
