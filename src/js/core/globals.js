export const Browser = {}

if (typeof window !== 'undefined') {
    Browser.SUPPORTED = !!window.requestAnimationFrame
    Browser.SUPPORTS_TOUCH = 'ontouchstart' in window
    Browser.touch = false
    // Chrome device/touch emulator can make this dynamic
    Browser.iOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
    Browser.dynamicInputDetection = true
}

export const Store = []

export const Selectors = {
    POPPER: '.tippy-popper',
    TOOLTIP: '.tippy-tooltip',
    CONTENT: '.tippy-tooltip-content',
    CIRCLE: '[x-circle]',
    ARROW: '[x-arrow]',
    TOOLTIPPED_EL: '[data-tooltipped]',
    CONTROLLER: '[data-tippy-controller]'
}

export const Defaults = {
    html: false,
    position: 'top',
    animation: 'shift',
    animateFill: true,
    arrow: false,
    arrowSize: 'regular',
    delay: 0,
    trigger: 'mouseenter focus',
    duration: 350,
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
    appendTo: null,
    zIndex: 9999,
    touchHold: false,
    performance: false,
    popperOptions: {}
}

export const DefaultsKeys = Browser.SUPPORTED && Object.keys(Defaults)
