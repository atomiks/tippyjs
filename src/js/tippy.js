import Popper from 'popper.js'

/**!
    * @file tippy.js | Pure JS Tooltip Library
    * @version 0.1.8
    * @license MIT
*/

class Tippy {
    constructor(selector, settings = {}) {
        // Use default browser tooltip on old browsers (IE < 10)
        if (!('addEventListener' in window) || /MSIE 9/i.test(navigator.userAgent)) return

        this.selector = selector
        this.callbacks = {}
        this.classNames = {
            popper: 'tippy-popper',
            tooltip: 'tippy-tooltip',
            content: 'tippy-tooltip-content'
        }
        this.tooltippedEls = [].slice.call(document.querySelectorAll(selector))
        this.settings = this._applyGlobalSettings(settings)

        // Tippy bus to handle events between different instances
        if (!Tippy.bus) {
            Tippy.bus = {
                refs: [],
                listeners: {}
            }
        }

        // Determine if touch user
        if (!Tippy.bus.listeners.touchstart) {
            Tippy.bus.listeners.touchstart = true
            const handleTouch = () => {
                Tippy.touchUser = true
                document.body.classList.add('tippy-touch')
                window.removeEventListener('touchstart', handleTouch)
            }
            window.addEventListener('touchstart', handleTouch)
        }

        this._createTooltips()
        this._handleDocumentHidingEvents()
    }

    /**
    * ================================PRIVATE METHODS================================
    */

    /**
    * Sets arrays of DOMElements for poppers and tooltipped elements
    */
    _setMaps() {
        Tippy.bus.popperMap = Tippy.bus.refs.map(ref => ref.popper)
        Tippy.bus.tooltippedElMap = Tippy.bus.refs.map(ref => ref.tooltippedEl)
    }

    /**
    * In-class polyfill to get closest parent based on a selector
    * @param {DOMElement} - element
    * @param {String} - parentSelector
    * @return {DOMElement}
    */
    _closest(element, parentSelector) {
        if (!Element.prototype.matches) {
            var isWebkit = 'WebkitAppearance' in document.documentElement.style
            if (isWebkit && !(/Edge\/\d./i.test(navigator.userAgent))) {
                Element.prototype.matches = Element.prototype.webkitMatchesSelector
            } else {
                Element.prototype.matches = Element.prototype.msMatchesSelector
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
        this.callbacks.beforeShown = settings.beforeShown || new Function()
        this.callbacks.shown = settings.shown || new Function()
        this.callbacks.beforeHidden = settings.beforeHidden || new Function()
        this.callbacks.hidden = settings.hidden || new Function()

        const defaults = {
            html: false,
            position: 'top',
            animation: 'shift',
            animateFill: true,
            arrow: false,
            delay: 0,
            trigger: 'mouseenter focus',
            duration: 400,
            interactive: false,
            theme: 'dark',
            offset: 0,
            hideOnClick: true
        }

        return {
            html: settings.html || defaults.html,
            position: settings.position || defaults.position,
            animation: settings.animation || defaults.animation,
            animateFill: settings.animateFill === false ? false : (settings.animateFill || defaults.animateFill),
            arrow: settings.arrow || defaults.arrow,
            delay: settings.delay || defaults.delay,
            trigger: settings.trigger || defaults.trigger,
            duration: settings.duration === 0 ? 0 : (settings.duration || defaults.duration),
            interactive: settings.interactive || defaults.interactive,
            theme: settings.theme || defaults.theme,
            offset: settings.offset || defaults.offset,
            hideOnClick: settings.hideOnClick === false ? false : (settings.hideOnClick || defaults.hideOnClick)
        }
    }

    /**
    * Creates document event listeners to handle clicks and keydowns
    */
    _handleDocumentHidingEvents() {

        /**
        * Gets the actual popper or tooltipped element from child element event bubbling
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
        * Returns the indices of the target in the DOMElement maps
        * @param {DOMElement} - target
        * @return {Object}
        */
        const getRefIndices = target => {
            let tooltippedElIndex = -1
            let popperIndex = -1

            // Ensure the target gets the actual element or popper (bubbles up from inner els)
            const eventTarget = actualElement(target)

            // Is a tooltipped element or popper
            if (eventTarget) {
                if (eventTarget.type === 'tooltippedEl') {
                    tooltippedElIndex = Tippy.bus.tooltippedElMap.indexOf(eventTarget.target)
                } else if (eventTarget.type === 'popper') {
                    popperIndex = Tippy.bus.popperMap.indexOf(eventTarget.target)
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
            const clearActive = () => [].slice.call(document.querySelectorAll('.active[data-tooltipped]'))
                                  .forEach(el => el.classList.remove('active'))

            const refIndices = getRefIndices(event.target)
            const clickedOnTooltippedEl = refIndices.tooltippedElIndex !== -1
            const clickedOnPopper = refIndices.popperIndex !== -1

            if (clickedOnPopper) {
                // Clicked on a popper, check if it's interactive, if so, do not hide
                const ref = Tippy.bus.refs[refIndices.popperIndex]
                if (ref.interactive) return
            }

            if (clickedOnTooltippedEl) {
                // Clicked on a tooltipped element
                // Do not hide if:
                // - It has hideOnClick: false, or
                // - It has a click trigger
                const ref = Tippy.bus.refs[refIndices.tooltippedElIndex]

                // Mobile/touch
                if (Tippy.touchUser) {
                    // Ensure only 1 tooltip is open at a time on touch devices
                    Tippy.bus.refs.forEach(r => {
                        if (r.popper !== ref.popper) this.hide(r.popper)
                    })
                    return
                }

                // Desktop/mouse
                if (!ref.hideOnClick || ref.trigger.indexOf('click') !== -1) return

            } else {
                clearActive()
            }

            Tippy.bus.refs.forEach(ref => this.hide(ref.popper))
        }

        /**
        * Event listener method for document keydown
        * @param {Object} - event
        */
        const handleKeydownHide = event => {
            const refIndices = getRefIndices(event.target)
            if (refIndices.tooltippedElIndex === -1) return
            if (event.keyCode === 9 &&
                !Tippy.bus.refs[refIndices.tooltippedElIndex].popper.classList.contains('html-template')) {
                Tippy.bus.refs.forEach(ref => this.hide(ref.popper))
            }
        }

        // Ensure only 1 instance makes a document handler
        if (!Tippy.bus.listeners.click) {
            Tippy.bus.listeners = {
                click: handleClickHide,
                keydown: handleKeydownHide
            }
            document.addEventListener('click', handleClickHide)
            document.addEventListener('keydown', handleKeydownHide)
        }
    }

    /**
    * Creates a new popper instance
    * @param {DOMElement} - tooltippedEl
    * @param {DOMElement} - popper
    * @param {Object} - settings
    */
    _createPopperInstance(tooltippedEl, popper, settings) {
        const config = {
            placement: settings.position,
            modifiers: {
                offset: {
                    offset: parseInt(settings.offset)
                }
            }
        }

        setTimeout(() => {
            const instance = new Popper(
                tooltippedEl,
                popper,
                config
            )
            instance.enableEventListeners()
        }, 0)
    }

    /**
    * Creates a popper element and appends it to the body, then returns it
    * @param {String} - title
    * @param {Object} - settings
    * @return {DOMElement}
    */
    _createPopperElement(title, settings) {
        const popper = document.createElement('div')
        popper.setAttribute('class', this.classNames.popper)

        const tooltip = document.createElement('div')
        tooltip.setAttribute('class', `${this.classNames.tooltip} ${settings.theme} leave`)
        tooltip.setAttribute('data-position', settings.position)
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
        document.body.appendChild(popper)

        return popper
    }

    /**
    * Returns an object of settings to override global settings
    * @param {DOMElement}
    * @return {Object} - settings
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

        // 'true', true, 'false', false
        let interactive = el.getAttribute('data-interactive') || this.settings.interactive
        if (interactive === 'false') interactive = false

        // '0', 0
        let offset = parseInt(el.getAttribute('data-offset'))
        if (!offset && offset !== 0) offset = this.settings.offset

        // 'true', true, 'false', false
        let hideOnClick = el.getAttribute('data-hideonclick') || this.settings.hideOnClick
        if (hideOnClick === 'false') hideOnClick = false

        return {
            html,
            position,
            animation,
            animateFill,
            arrow,
            delay,
            trigger,
            duration,
            interactive,
            theme,
            offset,
            hideOnClick
        }
    }

    /**
    * Creates tooltips for all elements that match the instance's selector
    */
    _createTooltips() {
        this.tooltippedEls.forEach(el => {

            // Individual tooltip settings with data-* attribute settings to override global
            const settings = this._applyIndividualSettings(el)

            const title = el.getAttribute('title')
            // Do not create a tooltip for title attributeless, empty strings or no html els
            if ((title === null || title === '') && !settings.html) return

            // Remove default browser tooltip
            el.setAttribute('data-original-title', title || 'html')
            el.removeAttribute('title')

            // Give elements a data-tooltipped attribute (needed for document click handler)
            el.setAttribute('data-tooltipped', '')

            // Create a new popper element and instance
            const popper = this._createPopperElement(title, settings)
            this._createPopperInstance(el, popper, settings)

            // Turn trigger string like "mouseenter focus" into an array
            if (!Array.isArray(settings.trigger)) {
                settings.trigger = settings.trigger.trim().split(' ')
            }

            /**
            * Event listener method for each trigger specified in settings
            * @param {Object} - event
            */
            const handleTrigger = event => {
                if (event.type === 'click' && popper.style.visibility === 'visible'
                && settings.hideOnClick) {
                    return this.hide(popper)
                }

                if (settings.delay) {
                    const timeout = setTimeout(
                        () => this.show(popper, settings.duration),
                        settings.delay
                    )
                    // Allow the hide() function to clear any unwanted timeouts due to delays
                    popper.setAttribute('data-timeout', timeout)
                } else {
                    this.show(popper, settings.duration)
                }

                if (settings.interactive) {
                    event.target.classList.add('active')
                }
            }

            /**
            * Event listener method for mouseleave
            * @param {Object} - event
            */
            const handleMouseleave = event => {
                // If interactive, only hide if the mouse left somewhere other than the popper
                if (settings.interactive) {
                    // Temporarily handle mousemove to check if the mouse left somewhere
                    // other than its popper
                    const handleMousemove = event => {
                        if (this._closest(event.target,`.${this.classNames.popper}`) !== popper
                        && !this._closest(event.target, '[data-tooltipped]')
                        && settings.trigger.indexOf('click') === -1)
                        {
                            el.classList.remove('active')
                            this.hide(popper)
                            document.removeEventListener('mousemove', handleMousemove)
                        }
                    }
                    document.addEventListener('mousemove', handleMousemove)
                    return
                }
                // If it's not interactive, just hide it
                this.hide(popper)
            }

            /**
            * Event listener method for blur
            * @param {Object} - event
            */
            const handleBlur = event => {
                // Do not hide on blur if touch user or it's interactive
                if (Tippy.touchUser || settings.interactive) return
                this.hide(popper)
            }

            // Add event listeners for each trigger specified
            const listeners = []

            settings.trigger.forEach(event => {
                if (event === 'manual') return

                // Enter
                el.addEventListener(event, handleTrigger)
                listeners.push({
                    event,
                    method: handleTrigger
                })

                // Leave
                if (event === 'mouseenter') {
                    el.addEventListener('mouseleave', handleMouseleave)
                    listeners.push({
                        event: 'mouseleave',
                        method: handleMouseleave
                    })
                }
                if (event === 'focus') {
                    el.addEventListener('blur', handleBlur)
                    listeners.push({
                        event: 'blur',
                        method: handleBlur
                    })
                }
            })

            // Add the element-popper pair reference object to global refs array
            Tippy.bus.refs.push({
                tooltippedEl: el,
                popper,
                interactive: settings.interactive,
                trigger: settings.trigger,
                hideOnClick: settings.hideOnClick,
                listeners
            })

            // If last el in loop, ready to set map cache
            if (el === this.tooltippedEls[this.tooltippedEls.length - 1]) {
                this._setMaps()
            }

        })
    }

    /**
    * ================================PUBLIC METHODS================================
    */

    /**
    * Returns a tooltipped element's popper reference
    * @param {DOMElement}
    * @return {DOMElement}
    */
    getPopperElement(el) {
        try {
            return Tippy.bus.refs[Tippy.bus.tooltippedElMap.indexOf(el)].popper
        } catch (e) {
            throw new Error('[Tippy error]: Element does not exist in any Tippy instances')
        }
    }

    /**
    * Shows a popper
    * @param {DOMElement} - popper
    * @param {Number} - duration (optional)
    */
    show(popper, duration = 400) {
        this.callbacks.beforeShown()

        const tooltip = popper.querySelector(`.${this.classNames.tooltip}`)
        const circle = popper.querySelector('[x-circle]')

        tooltip.style.WebkitTransitionDuration = duration + 'ms'
        tooltip.style.transitionDuration = duration + 'ms'
        tooltip.classList.add('enter')
        tooltip.classList.remove('leave')

        if (circle) {
            circle.style.WebkitTransitionDuration = duration + 'ms'
            circle.style.transitionDuration = duration + 'ms'
            circle.classList.add('enter')
            circle.classList.remove('leave')
        }

        popper.style.visibility = 'visible'
        popper.focus()

        setTimeout(() => {
            if (popper.style.visibility === 'hidden') return
            this.callbacks.shown()
        }, duration)
    }

    /**
    * Hides a popper
    * @param {DOMElement} - popper
    */
    hide(popper) {
        // Clear unwanted timeouts due to `delay` setting
        clearTimeout(popper.getAttribute('data-timeout'))

        // Hidden anyway
        if (getComputedStyle(popper).getPropertyValue('visibility') === 'hidden') return

        this.callbacks.beforeHidden()

        const ref = Tippy.bus.refs[Tippy.bus.popperMap.indexOf(popper)]
        ref.tooltippedEl.classList.remove('active')

        const tooltip = popper.querySelector(`.${this.classNames.tooltip}`)
        tooltip.classList.add('leave')
        tooltip.classList.remove('enter')

        const circle = popper.querySelector('[x-circle]')
        if (circle) {
            circle.classList.add('leave')
            circle.classList.remove('enter')
        }

        popper.style.visibility = 'hidden'

        let duration = 0
        if (tooltip.style.transitionDuration) {
            duration = parseInt(tooltip.style.transitionDuration.replace('ms', ''))
        } else if (tooltip.style.WebkitTransitionDuration) {
            duration = parseInt(tooltip.style.WebkitTransitionDuration.replace('ms', ''))
        }

        setTimeout(() => {
            if (popper.style.visibility === 'visible') return
            this.callbacks.hidden()
        }, duration)
    }

    /**
    * Destroys a popper
    * @param {DOMElement} - popper
    */
    destroy(popper) {
        const index = Tippy.bus.popperMap.indexOf(popper)

        // Remove Tippy-only event listeners from tooltipped element
        const el = Tippy.bus.tooltippedElMap[index]
        Tippy.bus.refs[index].listeners.forEach(
            listener => el.removeEventListener(listener.event, listener.method)
        )

        // Remove from global ref arrays
        Tippy.bus.popperMap.splice(index, 1)
        Tippy.bus.tooltippedElMap.splice(index, 1)
        Tippy.bus.refs.splice(index, 1)

        // Remove popper from body
        document.body.removeChild(popper)
    }
}

window.Tippy = Tippy
module.exports = Tippy
