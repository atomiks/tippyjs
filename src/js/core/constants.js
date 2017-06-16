export const BROWSER = {}

if (typeof window !== 'undefined') {
    BROWSER.supported = !!window.requestAnimationFrame
    BROWSER.supportsTouch = 'ontouchstart' in window
    BROWSER.touch = false
    BROWSER.iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
}

export const STORE = []

export const SELECTORS = {
    popper: '.tippy-popper',
    tooltip: '.tippy-tooltip',
    content: '.tippy-tooltip-content',
    circle: '[x-circle]',
    arrow: '[x-arrow]',
    el: '[data-tooltipped]',
    controller: '[data-tippy-controller]'
}

export const DEFAULT_SETTINGS = {
    html: false,
    position: 'top',
    animation: 'shift',
    animateFill: true,
    arrow: false,
    arrowSize: 'regular',
    delay: 0,
    trigger: 'mouseenter focus',
    duration: 375,
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

export const DEFAULT_SETTINGS_KEYS = BROWSER.supported && Object.keys(DEFAULT_SETTINGS)
