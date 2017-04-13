import Popper from 'popper.js'

/**!
    * @file tippy.js | Pure JS Tooltip Library
    * @version 0.3.5
    * @license MIT
*/

class Tippy {
    constructor(selector, settings = {}) {
        // Use default browser tooltip on old browsers (IE < 10) and Opera Mini
        if (!('addEventListener' in window)
        || /MSIE 9/i.test(navigator.userAgent)
        || window.operamini) return

        this.defaultSettings = {
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
        this.settings = this._applyGlobalSettings(settings)
        this.classNames = {
            popper: 'tippy-popper',
            tooltip: 'tippy-tooltip',
            content: 'tippy-tooltip-content'
        }

        // Check if selector is a DOM element
        this.tooltippedEls = (selector instanceof Element)
                             ? [selector]
                             : [].slice.call(document.querySelectorAll(selector))

        // Tippy bus to handle events between different instances
        if (!Tippy.bus) {
            Tippy.bus = {
                refs: [],
                tooltippedEls: [],
                poppers: [],
                listeners: {}
            }
        }

        // Determine if touch user
        if (!Tippy.bus.listeners.touchstart) {
            // Only needs to be determined in one instance
            Tippy.bus.listeners.touchstart = true

            const handleTouch = () => {
                Tippy.touchUser = true
                document.body.classList.add('tippy-touch')
                window.removeEventListener('touchstart', handleTouch)
            }
            window.addEventListener('touchstart', handleTouch)
        }

        this._createTooltips()
        if (!Tippy.bus.listeners.click) this._handleDocumentClick()
    }

    /**
    * ================================== PRIVATE METHODS ==================================
    */

    /**
    * In-class polyfill to get closest parent based on a selector
    * @param {DOMElement} - element
    * @param {String} - parentSelector
    * @return {DOMElement}
    */
    _closest(element, parentSelector) {
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
    * Returns a global settings object to be applied to the instance
    * @param {Object} - settings
    * @return {Object}
    */
    _applyGlobalSettings(settings) {
        // Object.assign polyfill
        if (typeof Object.assign != 'function') {
            Object.assign = function(target, varArgs) {
                'use strict'
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

        this.callbacks = {
            beforeShown: settings.beforeShown || new Function,
            shown: settings.shown || new Function,
            beforeHidden: settings.beforeHidden || new Function,
            hidden: settings.hidden || new Function
        }

        return Object.assign(this.defaultSettings, settings)
    }

    /**
    * Hides all poppers
    * @param {Object} - currentRef
    */
    _hideAllPoppers(currentRef = null) {
        Tippy.bus.refs.forEach(ref => {
            // Don't hide already hidden ones
            if (!document.body.contains(ref.popper)) return

            if (!currentRef) {
                if (ref.settings.hideOnClick && ref.settings.hideOnClick !== 'persistent') {
                    this.hide(ref.popper, ref.settings.hideDuration)
                }
            } else {
                if (
                    ref.popper !== currentRef.popper
                    && ref.settings.hideOnClick
                    && ref.settings.hideOnClick !== 'persistent'
                    )
                {
                    this.hide(ref.popper, ref.settings.hideDuration)
                }
            }

        })
    }

    /**
    * Creates document event listener to handle click on the document
    */
    _handleDocumentClick() {

        /**
        * Gets the actual popper or tooltipped element due to inner element event targets
        * @param {DOMElement} - target
        * @return {Object} or {null}
        */
        const actualElement = target => {
            const tooltippedEl = this._closest(target, '[data-tooltipped]')
            const popper = this._closest(target, `.${this.classNames.popper}`)
            let obj = {}

            if (tooltippedEl) {
                obj.type = 'tooltippedEl'
                obj.target = tooltippedEl
            } else if (popper) {
                obj.type = 'popper'
                obj.target = popper
            } else {
                obj = null
            }

            return obj
        }

        /**
        * Returns the indices of the target in the DOMElement arrays
        * @param {DOMElement} - target
        * @return {Object}
        */
        const getRefIndices = target => {
            let tooltippedElIndex = -1
            let popperIndex = -1

            // Ensure the target gets the actual element or popper as they could have clicked
            // on an inner element
            const eventTarget = actualElement(target)

            // Is a tooltipped element or popper
            if (eventTarget) {
                if (eventTarget.type === 'tooltippedEl') {
                    tooltippedElIndex = Tippy.bus.tooltippedEls.indexOf(eventTarget.target)
                } else if (eventTarget.type === 'popper') {
                    popperIndex = Tippy.bus.poppers.indexOf(eventTarget.target)
                }
            }

            return {
                tooltippedElIndex,
                popperIndex
            }
        }

        /**
        * Event listener method for document click
        * @param {Object} - event
        */
        const handleClickHide = event => {

            const refIndices = getRefIndices(event.target)
            const clickedOnTooltippedEl = refIndices.tooltippedElIndex !== -1
            const clickedOnPopper = refIndices.popperIndex !== -1

            if (clickedOnPopper) {
                const ref = Tippy.bus.refs[refIndices.popperIndex]
                if (ref.settings.interactive) return
            }

            if (clickedOnTooltippedEl) {
                const ref = Tippy.bus.refs[refIndices.tooltippedElIndex]

                if (
                    !ref.settings.multiple
                    && (ref.settings.trigger.indexOf('click') !== -1 || Tippy.touchUser)
                   )
                {
                    // Hide all except popper belonging to the element that was clicked on
                    return this._hideAllPoppers(ref)
                }

                // If hideOnClick is false or triggered by a click don't hide poppers
                if (!ref.settings.hideOnClick || ref.settings.trigger.indexOf('click') !== -1) return
            }

            this._hideAllPoppers()
        }

        Tippy.bus.listeners.click = handleClickHide
        document.addEventListener('click', handleClickHide)
    }

    /**
    * Creates a new popper instance
    * @param {DOMElement} - tooltippedEl
    * @param {DOMElement} - popper
    * @param {Object} - settings
    * @return {Object}
    */
    _createPopperInstance(tooltippedEl, popper, settings) {
        const config = {
            placement: settings.position,
            ...(settings.popperOptions || {}),
            modifiers: {
                ...(settings.popperOptions ? settings.popperOptions.modifiers : {}),
                offset: {
                    offset: parseInt(settings.offset),
                    ...(settings.popperOptions && settings.popperOptions.modifiers ? settings.popperOptions.modifiers.offset : {})
                }
            }
        }

        // Temporarily append popper for Popper.js
        document.body.appendChild(popper)

        const instance = new Popper(
            tooltippedEl,
            popper,
            config
        )
        instance.disableEventListeners()

        document.body.removeChild(popper)

        return instance
    }

    /**
    * Creates a popper element then returns it
    * @param {String} - title
    * @param {Object} - settings
    * @return {DOMElement}
    */
    _createPopperElement(title, settings) {
        const popper = document.createElement('div')
        popper.setAttribute('class', this.classNames.popper)

        // Fix for iOS animateFill
        if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
            popper.classList.add('tippy-iOS-fix')
        }

        const tooltip = document.createElement('div')
        tooltip.setAttribute('class', `${this.classNames.tooltip} ${settings.theme} leave`)
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
        content.setAttribute('class', this.classNames.content)

        if (settings.html) {
            content.innerHTML = document.getElementById(settings.html.replace('#', '')).innerHTML
            popper.classList.add('html-template')
            popper.setAttribute('tabindex', '0')
            tooltip.setAttribute('data-template-id', settings.html)
        } else {
            content.innerHTML = title
        }

        tooltip.appendChild(content)
        popper.appendChild(tooltip)

        return popper
    }

    /**
    * Returns an object of settings to override global settings
    * @param {DOMElement} - el
    * @return {Object}
    */
    _applyIndividualSettings(el) {
        // Some falsey values require more verbose defining

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
    * Returns relevant listeners for each ref
    * @param {DOMElement} - tooltippedEl
    * @param {DOMElement} - popper
    * @return {Object}
    */
    _getEventListenerMethods(tooltippedEl, popper, settings) {

        // Avoid creating unnecessary timeouts

        const show = () => {
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
                        this._closest(event.target,`.${this.classNames.popper}`) !== popper
                        && this._closest(event.target, '[data-tooltipped]') !== tooltippedEl
                        && settings.trigger.indexOf('click') === -1
                       )
                    {
                        document.removeEventListener('mousemove', handleMousemove)
                        tooltippedEl.classList.remove('active')
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
            if (!Tippy.touchUser && event.relatedTarget) {
                if (!this._closest(event.relatedTarget, `.${this.classNames.popper}`)) {
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
    * Creates a trigger for each one specified
    * @param {DOMElement} - tooltippedEl
    * @param {Object} - methods
    * @param {Object} - event
    * @param {Array} - listeners
    * @return {Array}
    */
    _createTrigger(event, tooltippedEl, methods, listeners) {
        if (event === 'manual') return

        // Enter
        tooltippedEl.addEventListener(event, methods.handleTrigger)
        listeners.push({
            event,
            method: methods.handleTrigger
        })

        // Leave
        if (event === 'mouseenter') {
            tooltippedEl.addEventListener('mouseleave', methods.handleMouseleave)
            listeners.push({
                event: 'mouseleave',
                method: methods.handleMouseleave
            })
        }
        if (event === 'focus') {
            tooltippedEl.addEventListener('blur', methods.handleBlur)
            listeners.push({
                event: 'blur',
                method: methods.handleBlur
            })
        }

        return listeners
    }

    /**
    * Adds each reference (tooltipped element, popper and its settings/listeners etc)
    * into global bus
    * @param {Object} - ref
    */
    _pushIntoTippyBus(ref) {
        Tippy.bus.refs.push(ref)
        Tippy.bus.tooltippedEls.push(ref.tooltippedEl)
        Tippy.bus.poppers.push(ref.popper)
    }

    /**
    * Creates tooltips for all elements that match the instance's selector
    */
    _createTooltips() {
        this.tooltippedEls.forEach(tooltippedEl => {

            const settings = this._applyIndividualSettings(tooltippedEl)

            const title = tooltippedEl.getAttribute('title')
            if ((title === null || title === '') && !settings.html) return

            // Remove default browser tooltip
            tooltippedEl.setAttribute('data-tooltipped', '')
            tooltippedEl.setAttribute('data-original-title', title || 'html')
            tooltippedEl.removeAttribute('title')

            const popper = this._createPopperElement(title, settings)
            const instance = this._createPopperInstance(tooltippedEl, popper, settings)
            const methods = this._getEventListenerMethods(tooltippedEl, popper, settings)
            let listeners = []

            settings.trigger.forEach(event => {
                listeners = this._createTrigger(event, tooltippedEl, methods, listeners) || []
            })

            this._pushIntoTippyBus({
                tooltippedEl,
                popper,
                settings,
                listeners,
                instance
            })

        })
    }

    /**
    * Mousemove event listener method for follow cursor setting
    * @param {Object} - e (event)
    */
    _followCursor(e) {
        const ref = Tippy.bus.refs[Tippy.bus.tooltippedEls.indexOf(this)]
        const position = ref.settings.position
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

        ref.popper.style.WebkitTransform = `translate3d(${x}px, ${y}px, 0)`
        ref.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    /**
    * ================================== PUBLIC METHODS ==================================
    */

    /**
    * Returns a tooltipped element's popper reference
    * @param {DOMElement}
    * @return {DOMElement}
    */
    getPopperElement(el) {
        try {
            return Tippy.bus.refs[Tippy.bus.tooltippedEls.indexOf(el)].popper
        } catch (e) {
            throw new Error('[Tippy error]: Element does not exist in any Tippy instances')
        }
    }

    /**
    * Shows a popper
    * @param {DOMElement} - popper
    * @param {Number} - duration (optional)
    */
    show(popper, duration = this.defaultSettings.duration) {

        // Already visible
        if (popper.style.visibility === 'visible') return

        this.callbacks.beforeShown()

        popper.style.visibility = 'visible'

        const ref = Tippy.bus.refs[Tippy.bus.poppers.indexOf(popper)]
        const tooltip = popper.querySelector(`.${this.classNames.tooltip}`)
        const circle = popper.querySelector('[x-circle]')
        const arrow = popper.querySelector('[x-arrow]')

        document.body.appendChild(popper)

        // Follow cursor setting, not applicable to touch users
        if (ref.settings.followCursor && !Tippy.touchUser) {
            if (!ref.hasFollowCursorListener) {
                ref.hasFollowCursorListener = true
                ref.tooltippedEl.addEventListener('mousemove', this._followCursor)
            }
        } else {
            ref.instance.enableEventListeners()
        }

        ref.instance.update()

        // Repaint is required for CSS transition when appending
        getComputedStyle(tooltip).opacity

        tooltip.style.WebkitTransitionDuration = duration + 'ms'
        tooltip.style.transitionDuration = duration + 'ms'
        tooltip.classList.add('enter')
        tooltip.classList.remove('leave')

        if (circle) {
            // Repaint
            const style = getComputedStyle(circle)
            if (!style.transform) style.WebkitTransform
            style.transform

            circle.style.WebkitTransitionDuration = duration + 'ms'
            circle.style.transitionDuration = duration + 'ms'
            circle.classList.add('enter')
            circle.classList.remove('leave')
        }

        const onShown = () => {
            if (popper.style.visibility === 'hidden') return

            // Focus click triggered tooltips (popovers) only
            if (ref.settings.trigger.indexOf('click') !== -1) {
                popper.focus()
            }

            this.callbacks.shown()
        }

        // Wait for transitions to complete
        // transitionend listener is not as reliable as timeouts for now
        clearTimeout(ref.showTimeout)
        ref.showTimeout = setTimeout(onShown, duration)
    }

    /**
    * Hides a popper
    * @param {DOMElement} - popper
    * @param {Number} - duration (optional)
    */
    hide(popper, duration = this.settings.duration) {
        // Clear unwanted timeouts due to `delay` setting
        clearTimeout(popper.getAttribute('data-delay'))

        // Hidden anyway
        if (!document.body.contains(popper)) return

        this.callbacks.beforeHidden()

        popper.style.visibility = 'hidden'

        const ref = Tippy.bus.refs[Tippy.bus.poppers.indexOf(popper)]
        const tooltip = popper.querySelector(`.${this.classNames.tooltip}`)
        const circle = popper.querySelector('[x-circle]')

        ref.tooltippedEl.classList.remove('active')

        // Use the same duration as the show if it's the default
        if (duration === this.defaultSettings.hideDuration) {
            if (tooltip.style.transitionDuration) {
                duration = parseInt(tooltip.style.transitionDuration.replace('ms', ''))
            } else if (tooltip.style.WebkitTransitionDuration) {
                duration = parseInt(tooltip.style.WebkitTransitionDuration.replace('ms', ''))
            }
        } else {
            tooltip.style.WebkitTransitionDuration = duration + 'ms'
            tooltip.style.transitionDuration = duration + 'ms'
            if (circle) {
                circle.style.WebkitTransitionDuration = duration + 'ms'
                circle.style.transitionDuration = duration + 'ms'
            }
        }

        tooltip.classList.add('leave')
        tooltip.classList.remove('enter')
        if (circle) {
            circle.classList.add('leave')
            circle.classList.remove('enter')
        }

        // Re-focus tooltipped element if it's a HTML popover
        if (ref.settings.html && ref.settings.trigger.indexOf('click') !== -1) {
            ref.tooltippedEl.focus()
        }

        const onHidden = () => {
            if (popper.style.visibility === 'visible') return

            // Follow cursor setting
            if (ref.hasFollowCursorListener) {
                ref.tooltippedEl.removeEventListener('mousemove', this._followCursor)
                ref.hasFollowCursorListener = false
            }

            if (document.body.contains(popper)) {
                document.body.removeChild(popper)
            }

            ref.instance.disableEventListeners()

            this.callbacks.hidden()
        }

        // Wait for transitions to complete
        // transitionend listener is not as reliable as timeouts for now
        clearTimeout(ref.hideTimeout)
        ref.hideTimeout = setTimeout(onHidden, duration)
    }

    /**
    * Destroys a popper
    * @param {DOMElement} - popper
    */
    destroy(popper) {
        const index = Tippy.bus.poppers.indexOf(popper)
        const ref = Tippy.bus.refs[index]

        // Remove Tippy-only event listeners from tooltipped element
        ref.listeners.forEach(
            listener => ref.tooltippedEl.removeEventListener(listener.event, listener.method)
        )

        ref.instance.destroy()

        // Remove from global ref arrays
        Tippy.bus.poppers.splice(index, 1)
        Tippy.bus.tooltippedEls.splice(index, 1)
        Tippy.bus.refs.splice(index, 1)
    }
}

window.Tippy = Tippy
module.exports = Tippy
