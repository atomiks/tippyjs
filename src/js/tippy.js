// For some reason the ES6 version won't transpile, will find a fix later
//import Popper from 'popper.js'
import Popper from '../../node_modules/popper.js/dist/popper.es5.js'

/**!
* @file tippy.js | Pure JS Tooltip Library
* @version 0.5.0
* @license MIT
*/

// Touch user is assumed false until a `touchstart` event listener is fired
let touchUser = false

// Storage object to hold all references from instance instantiation
// Allows us to hide tooltips from other instances when clicking on the body
const store = {
    refs: [],
    els: [],
    poppers: []
}

const DEFAULTS = {
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
}

const elementSelectors = {
    popper: '.tippy-popper',
    tooltip: '.tippy-tooltip',
    content: '.tippy-tooltip-content',
    circle: '[x-circle]',
    arrow: '[x-arrow]',
    el: '[data-tooltipped]',
    controller: '[data-tippy-controller]'
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
* Polyfill to get the closest parent element
* @param {Element} element - child of parent to be returned
* @param {String} parentSelector - selector to match the parent if found
* @return {Element}
*/
function closest(element, parentSelector) {
    if (!Element.prototype.matches) {
        if (element.matchesSelector) {
            Element.prototype.matches = Element.prototype.matchesSelector
        } else if (element.webkitMatchesSelector) {
            Element.prototype.matches = Element.prototype.webkitMatchesSelector
        } else if (element.mozMatchesSelector) {
            Element.prototype.matches = Element.prototype.mozMatchesSelector
        } else if (element.msMatchesSelector) {
            Element.prototype.matches = Element.prototype.msMatchesSelector
        } else {
            return element
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
* Creates a new popper instance
* @param {Element} el
* @param {Element} popper
* @param {Object} settings
* @return {Object} - the popper instance
*/
function createPopperInstance(el, popper, settings) {
    const config = {
        placement: settings.position,
        ...(settings.popperOptions || {}),
        modifiers: {
            ...(settings.popperOptions ? settings.popperOptions.modifiers : {}),
            flip: {
                padding: 15,
                ...(settings.popperOptions && settings.popperOptions.modifiers ? settings.popperOptions.modifiers.flip : {})
            },
            offset: {
                offset: parseInt(settings.offset),
                ...(settings.popperOptions && settings.popperOptions.modifiers ? settings.popperOptions.modifiers.offset : {})
            }
        }
    }

    // Temporarily append popper for Popper.js
    document.body.appendChild(popper)

    const instance = new Popper(
        el,
        popper,
        config
    )
    instance.disableEventListeners()

    document.body.removeChild(popper)

    return instance
}

/**
* Creates a popper element then returns it
* @param {String} title - the tooltip's `title` attribute
* @param {Object} settings - individual settings
* @return {Element} - the popper element
*/
function createPopperElement(title, settings) {
    const popper = document.createElement('div')
    popper.setAttribute('class', 'tippy-popper')

    // Fix for iOS animateFill
    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
        popper.classList.add('tippy-iOS-fix')
    }

    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', `tippy-tooltip ${settings.theme} leave`)
    tooltip.setAttribute('data-animation', settings.animation)

    if (settings.arrow) {
        // Add an arrow
        const arrow = document.createElement('div')
        arrow.setAttribute('x-arrow', '')
        tooltip.appendChild(arrow)
    }

    if (settings.animateFill) {
        // Create animateFill circle element for animation
        tooltip.setAttribute('data-animatefill', '')
        const circle = document.createElement('div')
        circle.setAttribute('class', 'leave')
        circle.setAttribute('x-circle', '')
        tooltip.appendChild(circle)
    }

    if (settings.inertia) {
        // Change transition timing function cubic bezier
        tooltip.setAttribute('data-inertia', '')
    }

    // Tooltip content (text or HTML)
    const content = document.createElement('div')
    content.setAttribute('class', 'tippy-tooltip-content')

    if (settings.html) {

        let templateId

        if (settings.html instanceof Element) {
            content.innerHTML = settings.html.innerHTML
            templateId = settings.html.id || 'tippy-html-template'
        } else {
            content.innerHTML = document.getElementById(settings.html.replace('#', '')).innerHTML
            templateId = settings.html
        }

        popper.classList.add('html-template')
        popper.setAttribute('tabindex', '0')
        tooltip.setAttribute('data-template-id', templateId)

    } else {
        content.innerHTML = title
    }

    tooltip.appendChild(content)
    popper.appendChild(tooltip)

    return popper
}

/**
* Creates a trigger for each one specified
* @param {Object} event - the custom event specified in the `trigger` setting
* @param {Element} el
* @param {Object} methods - the methods for each listener
* @return {Array} - array of listener objects
*/
function createTrigger(event, el, methods) {
    if (event === 'manual') return

    const listeners = []

    // Enter
    el.addEventListener(event, methods.handleTrigger)
    listeners.push({
        event,
        method: methods.handleTrigger
    })

    // Leave
    if (event === 'mouseenter') {
        el.addEventListener('mouseleave', methods.handleMouseleave)
        listeners.push({
            event: 'mouseleave',
            method: methods.handleMouseleave
        })
    }
    if (event === 'focus') {
        el.addEventListener('blur', methods.handleBlur)
        listeners.push({
            event: 'blur',
            method: methods.handleBlur
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
    store.refs.push(ref)
    store.els.push(ref.el)
    store.poppers.push(ref.popper)
}

/**
* Removes the title from the tooltipped element
* @param {Element} el
*/
function removeTitle(el) {
    const title = el.getAttribute('title')
    el.setAttribute('data-original-title', title || 'html')
    el.removeAttribute('title')
}

/**
* Mousemove event listener callback method for follow cursor setting
* @param {Object} e (event)
*/
function followCursor(e) {
    const ref = store.refs[store.els.indexOf(this)]
    const position = ref.popper.getAttribute('x-placement')
    const offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    const halfPopperWidth = Math.round( ref.popper.offsetWidth / 2 )
    const halfPopperHeight = Math.round( ref.popper.offsetHeight / 2 )

    // Default = top
    let x = e.clientX - halfPopperWidth
    let y = e.clientY + offset - 50

    if (position === 'left') {
        x = e.clientX - ( 2 * halfPopperWidth ) - 10
        y = e.clientY + offset - halfPopperHeight
    } else if (position === 'right') {
        x = e.clientX + 15
        y = e.clientY + offset - halfPopperHeight
    } else if (position === 'bottom') {
        y = e.clientY + offset + 15
    }

    ref.popper.style[prefix('transform')] = `translate3d(${x}px, ${y}px, 0)`
}

/**
* Returns a global settings object to be applied to a Tippy instance
* @param {Object} - settings
* @return {Object}
*/
function applyGlobalSettings(settings) {
    // Object.assign polyfill
    if (typeof Object.assign != 'function') {
        Object.assign = function(target, varArgs) {
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
    return Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), settings)
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
* The class to be exported to be used on the `window`
* Private methods are prefixed with an underscore _
* @param {String} || {Element} selector
* @param {Object} settings (optional) - the object of settings to be applied to the instance
*/
export default class Tippy {
    constructor(selector, settings = {}) {

        // Use default browser tooltip on old browsers (IE < 10) and Opera Mini
        if (
            !('addEventListener' in window) ||
            /MSIE 9/i.test(navigator.userAgent) ||
            window.operamini
        ) return

        this.settings = applyGlobalSettings(settings)

        this.callbacks = {
            wait: settings.wait,
            beforeShown: settings.beforeShown || new Function,
            shown: settings.shown || new Function,
            beforeHidden: settings.beforeHidden || new Function,
            hidden: settings.hidden || new Function
        }

        // Check if selector is a DOM element
        this.els = (selector instanceof Element)
                    ? [selector]
                    : [].slice.call(document.querySelectorAll(selector))

        this._createTooltips()
        this._handleDocumentEvents()
    }

    /**
    * Returns an object of settings to override global settings
    * @param {Element} el - the tooltipped element
    * @return {Object} - individual settings
    */
    _applyIndividualSettings(el) {
        // Some falsy values require more verbose defining

        // false, 'false', or a template id
        let html = el.getAttribute('data-html') || this.settings.html
        if (!html || html === 'false') html = false

        // 'top', 'bottom', 'left', 'right'
        let position = el.getAttribute('data-position') || this.settings.position

        // 'shift', 'perspective', 'scale', 'fade'
        let animation = el.getAttribute('data-animation') || this.settings.animation

        // 'true', true, 'false', false
        let animateFill = el.getAttribute('data-animatefill') || this.settings.animateFill
        if (animateFill === 'false') animateFill = false

        // 'true', true, 'false', false
        let arrow = el.getAttribute('data-arrow') || this.settings.arrow
        if (!arrow || arrow === 'false') arrow = false
        else animateFill = false

        // 'mouseenter focus' string to array
        let trigger = el.getAttribute('data-trigger') || this.settings.trigger
        if (trigger) trigger = trigger.trim().split(' ')

        // 'dark', 'light', '{custom}'
        let theme = el.getAttribute('data-theme') || this.settings.theme
        if (theme) theme += '-theme'

        // 0, '0'
        let delay = parseInt(el.getAttribute('data-delay'))
        if (!delay && delay !== 0) delay = this.settings.delay

        // 0, '0'
        let duration = parseInt(el.getAttribute('data-duration'))
        if (!duration && duration !== 0) duration = this.settings.duration

        // 0, '0'
        let hideDuration = parseInt(el.getAttribute('data-hideduration'))
        if (!hideDuration && hideDuration !== 0) hideDuration = this.settings.hideDuration

        // 'true', true, 'false', false
        let interactive = el.getAttribute('data-interactive') || this.settings.interactive
        if (interactive === 'false') interactive = false

        // '0', 0
        let offset = parseInt(el.getAttribute('data-offset'))
        if (!offset && offset !== 0) offset = this.settings.offset

        // 'true', true, 'false', false
        let hideOnClick = el.getAttribute('data-hideonclick') || this.settings.hideOnClick
        if (hideOnClick === 'false') hideOnClick = false

        // 'true', true, 'false', false
        let multiple = el.getAttribute('data-multiple') || this.settings.multiple
        if (multiple === 'false') multiple = false

        // 'true', true, 'false', false
        let followCursor = el.getAttribute('data-followcursor') || this.settings.followCursor
        if (followCursor === 'false') followCursor = false

        // 'true', true, 'false', false
        let inertia = el.getAttribute('data-inertia') || this.settings.inertia
        if (inertia === 'false') inertia = false

        // just take the provided value
        const popperOptions = this.settings.popperOptions

        return {
            html,
            position,
            animation,
            animateFill,
            arrow,
            delay,
            trigger,
            duration,
            hideDuration,
            interactive,
            theme,
            offset,
            hideOnClick,
            multiple,
            followCursor,
            inertia,
            popperOptions
        }
    }

    /**
    * Hides all poppers
    * @param {Object} - currentRef
    */
    _hideAllPoppers(currentRef) {
        store.refs.forEach(ref => {
            // Don't hide already hidden ones
            if (!document.body.contains(ref.popper)) return

            // hideOnClick can have the truthy value of 'persistent', so strict check is needed
            if (ref.settings.hideOnClick === true
                && (!currentRef || ref.popper !== currentRef.popper)
               )
            {
                this.hide(ref.popper, ref.settings.hideDuration)
            }

        })
    }

    /**
    * Creates listeners on the document for click and touch start (to determine touch users)
    * Only relevant by the first Tippy instance that is created
    */
    _handleDocumentEvents() {

        const handleClick = event => {

            const el = closest(event.target, elementSelectors.el)
            const popper = closest(event.target, elementSelectors.popper)

            if (popper) {
                const ref = store.refs[store.poppers.indexOf(popper)]
                if (ref.settings.interactive) return
            }

            if (el) {
                const ref = store.refs[store.els.indexOf(el)]

                // Hide all poppers except the one belonging to the element that was clicked IF
                // `multiple` is false AND they are a touch user, OR
                // `multiple` is false AND it's triggered by a click
                if (
                    (!ref.settings.multiple && touchUser) ||
                    (!ref.settings.multiple && ref.settings.trigger.indexOf('click') !== -1)
                )
                {
                    return this._hideAllPoppers(ref)
                }

                // If hideOnClick is not strictly true or triggered by a click don't hide poppers
                if (ref.settings.hideOnClick !== true ||
                    ref.settings.trigger.indexOf('click') !== -1
                ) return
            }

            // Don't trigger a hide for tippy controllers
            if (!closest(event.target, elementSelectors.controller)) {
                this._hideAllPoppers()
            }
        }

        const handleTouch = () => {
            touchUser = true
            document.body.classList.add('tippy-touch')
            document.removeEventListener('touchstart', handleTouch)
        }

        if (!store.listeners) {
            store.listeners = {
                click: handleClick,
                touchstart: handleTouch,
            }
            document.addEventListener('click', handleClick)
            document.addEventListener('touchstart', handleTouch)
        }
    }

    /**
    * Returns relevant listener callback methods for each ref
    * @param {Element} el
    * @param {Element} popper
    * @param {Object} settings
    * @return {Object} - relevant listener callback methods
    */
    _getEventListenerMethods(el, popper, settings) {

        // Avoid creating unnecessary timeouts
        const _show = () => {
            if (settings.delay) {
                const delay = setTimeout(
                    () => this.show(popper, settings.duration),
                    settings.delay
                )
                popper.setAttribute('data-delay', delay)
            } else {
                this.show(popper, settings.duration)
            }
        }

        const show = () => this.callbacks.wait ? this.callbacks.wait(_show) : _show()
        const hide = () => this.hide(popper, settings.hideDuration)

        const handleTrigger = event => {

            // Interactive tooltips receive a class of 'active'
            if (settings.interactive) {
                event.target.classList.add('active')
            }

            // Toggle show/hide when clicking click-triggered tooltips
            if (
                event.type === 'click'
                && popper.style.visibility === 'visible'
                && settings.hideOnClick !== 'persistent'
            )
            {
                return hide()
            }

            show()
        }

        const handleMouseleave = event => {

            if (settings.interactive) {
                // Temporarily handle mousemove to check if the mouse left somewhere
                // other than its popper
                const handleMousemove = event => {
                    // If cursor is NOT on the popper
                    // and it's NOT on the popper's tooltipped element
                    // and it's NOT triggered by a click, then hide
                    if (
                        closest(event.target, elementSelectors.popper) !== popper
                        && closest(event.target, elementSelectors.el) !== el
                        && settings.trigger.indexOf('click') === -1
                    )
                    {
                        document.removeEventListener('mousemove', handleMousemove)
                        hide()
                    }
                }
                document.addEventListener('mousemove', handleMousemove)
                return
            }

            // If it's not interactive, just hide it
            hide()
        }

        const handleBlur = event => {
            // Only hide if not a touch user and has a focus 'relatedtarget', of which is not
            // a popper element
            if (!touchUser && event.relatedTarget) {
                if (!closest(event.relatedTarget, elementSelectors.popper)) {
                    hide()
                }
            }
        }

        return {
            handleTrigger,
            handleMouseleave,
            handleBlur
        }
    }

    /**
    * Creates tooltips for all elements that match the instance's selector
    */
    _createTooltips() {
        this.els.forEach(el => {

            el.setAttribute('data-tooltipped', '')

            const settings = this._applyIndividualSettings(el)

            const title = el.getAttribute('title')
            if (!title && !settings.html) return

            removeTitle(el)

            const popper = createPopperElement(title, settings)
            const instance = createPopperInstance(el, popper, settings)
            const methods = this._getEventListenerMethods(el, popper, settings)
            let listeners = []

            settings.trigger.forEach(event => {
                listeners = listeners.concat(createTrigger(event, el, methods))
            })

            pushIntoStorage({
                el,
                popper,
                settings,
                listeners,
                instance
            })

        })

        Tippy.store = store // Allow others to access `store` if need be
    }

    /**
    * Fixes CSS transition when showing a flipped tooltip
    * @param {Object} ref - the popper/element reference
    * @param {Number} duration
    */
    _adjustFlip(ref, duration) {
        const flipAdjust = () => {
            this.hide(ref.popper, 0, false)
            setTimeout(() => this.show(ref.popper, duration, false), 0)
        }
        setTimeout(() => {
            const position = ref.popper.getAttribute('x-placement')

            if (!ref.adjusted && ref.settings.position !== position) {
                ref.adjusted = true
                flipAdjust()
            } else if (ref.adjusted && ref.settings.position === position) {
                ref.adjusted = false
                flipAdjust()
            }
        }, 0)

    }

    /**
    * Returns a tooltipped element's popper reference
    * @param {Element} el
    * @return {Element}
    */
    getPopperElement(el) {
        try {
            return store.refs[store.els.indexOf(el)].popper
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
            return store.refs[store.poppers.indexOf(popper)].el
        } catch (e) {
            throw new Error('[Tippy error]: Popper does not exist in any Tippy instances')
        }
    }

    /**
    * Shows a popper
    * @param {Element} popper
    * @param {Number} duration (optional)
    * @param {Boolean} enableCallback (optional)
    */
    show(popper, duration = this.settings.duration, enableCallback = true) {

        // Already visible
        if (popper.style.visibility === 'visible') return

        const ref = store.refs[store.poppers.indexOf(popper)]
        const tooltip = popper.querySelector(elementSelectors.tooltip)
        const circle = popper.querySelector(elementSelectors.circle)

        if (enableCallback) this.callbacks.beforeShown()

        document.body.appendChild(popper)

        popper.style.visibility = 'visible'

        // Follow cursor setting, not applicable to touch users
        if (ref.settings.followCursor && !touchUser) {
            if (!ref.hasFollowCursorListener) {
                ref.hasFollowCursorListener = true
                ref.el.addEventListener('mousemove', followCursor)
            }
        } else {
            ref.instance.enableEventListeners()
        }

        ref.instance.update()

        this._adjustFlip(ref, duration)

        // Repaint is required for CSS transition when appending
        getComputedStyle(tooltip).opacity

        tooltip.style[prefix('transitionDuration')] = duration + 'ms'
        tooltip.classList.add('enter')
        tooltip.classList.remove('leave')

        if (circle) {
            // Reflow
            getComputedStyle(circle)[prefix('transform')]

            circle.style[prefix('transitionDuration')] = duration + 'ms'
            circle.classList.add('enter')
            circle.classList.remove('leave')
        }

        const onShown = () => {
            popper.removeEventListener('webkitTransitionEnd', onShown)
            popper.removeEventListener('transitionend', onShown)

            if (popper.style.visibility === 'hidden' || ref.onShownFired) return

            // Focus click triggered interactive tooltips (popovers) only
            if (ref.settings.interactive && ref.settings.trigger.indexOf('click') !== -1) {
                popper.focus()
            }

            ref.onShownFired = true

            this.callbacks.shown()
        }

        if (duration < 20) {
            return onShown()
        }

        // Wait for transitions to complete
        popper.addEventListener('webkitTransitionEnd', onShown)
        popper.addEventListener('transitionend', onShown)
    }

    /**
    * Hides a popper
    * @param {Element} popper
    * @param {Number} duration (optional)
    * @param {Boolean} enableCallback (optional)
    */
    hide(popper, duration = this.settings.duration, enableCallback = true) {
        // Clear unwanted timeouts due to `delay` setting
        clearTimeout(popper.getAttribute('data-delay'))

        // Hidden anyway
        if (!document.body.contains(popper)) return

        const ref = store.refs[store.poppers.indexOf(popper)]
        const tooltip = popper.querySelector(elementSelectors.tooltip)
        const circle = popper.querySelector(elementSelectors.circle)

        if (enableCallback) {
            this.callbacks.beforeHidden()
            ref.el.classList.remove('active')
            ref.onShownFired = false
        }

        popper.style.visibility = 'hidden'

        // Use the same duration as the show if it's the default

        if (duration === DEFAULTS.hideDuration) {
            if (prefix('transitionDuration')) {
                duration = parseInt(tooltip.style[prefix('transitionDuration')].replace('ms', ''))
            }
        } else {
            tooltip.style[prefix('transitionDuration')] = duration + 'ms'
            if (circle) circle.style[prefix('transitionDuration')] = duration + 'ms'
        }

        tooltip.classList.add('leave')
        tooltip.classList.remove('enter')
        if (circle) {
            circle.classList.add('leave')
            circle.classList.remove('enter')
        }

        // Re-focus tooltipped element if it's a HTML popover
        // and the tooltipped element IS in the viewport (otherwise it causes unsightly scrolling
        // if the tooltip is closed and the element isn't in the viewport anymore)
        if (
            ref.settings.html &&
            ref.settings.trigger.indexOf('click') !== -1 &&
            elementIsInViewport(ref.el)
           )
        {
            ref.el.focus()
        }

        const onHidden = () => {
            popper.removeEventListener('webkitTransitionEnd', onHidden)
            popper.removeEventListener('transitionend', onHidden)

            if (popper.style.visibility === 'visible' || !document.body.contains(popper)) return

            // Follow cursor setting
            if (ref.hasFollowCursorListener) {
                ref.el.removeEventListener('mousemove', followCursor)
                ref.hasFollowCursorListener = false
            }

            ref.instance.disableEventListeners()

            document.body.removeChild(popper)

            if (enableCallback) this.callbacks.hidden()
        }

        if (duration < 20) {
            return onHidden()
        }

        // Wait for transitions to complete
        ref.onHidden = onHidden

        popper.addEventListener('webkitTransitionEnd', onHidden)
        popper.addEventListener('transitionend', onHidden)
    }

    /**
    * Destroys a popper
    * @param {Element} popper
    */
    destroy(popper) {
        const index = store.poppers.indexOf(popper)
        const ref = store.refs[index]

        // Remove Tippy-only event listeners from tooltipped element
        ref.listeners.forEach(
            listener => ref.el.removeEventListener(listener.event, listener.method)
        )

        ref.el.removeAttribute('data-tooltipped')

        ref.instance.destroy()

        // Remove from storage
        store.refs.splice(index, 1)
        store.els.splice(index, 1)
        store.poppers.splice(index, 1)
    }

    /**
    * Updates a popper with new content
    * @param {Element} popper
    */
    update(popper) {
        const ref = store.refs[store.poppers.indexOf(popper)]
        const content = popper.querySelector(elementSelectors.content)
        const template = ref.settings.html

        if (template) {
            content.innerHTML = (template instanceof Element)
                                ? template.innerHTML
                                : document.getElementById(template.replace('#', '')).innerHTML
        } else {
            content.innerHTML = ref.el.getAttribute('title') ||
            ref.el.getAttribute('data-original-title')
            removeTitle(ref.el)
        }
    }
}
