if (!Element.prototype.matches) {
    var isWebkit = 'WebkitAppearance' in document.documentElement.style
    if (isWebkit) {
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

var timeout = 800
if (window.pageYOffset > 250 || document.documentElement.scrollTop > 250) {
    timeout = 0
}
setTimeout(function() {
    document.querySelector('.hero').classList.add('enter')
}, timeout/4)
setTimeout(function() {
    document.querySelector('main .container-fluid').classList.add('enter')
}, timeout)

new Tippy('.tippy')

new Tippy('.tippy-link', {
    theme: 'light',
    arrow: true
})
var instance = new Tippy('#callback-tippy', {
  shown: function() {
    alert('Hello from the shown() callback!')
    document.getElementById('callback-tippy').blur()
  }
})

function hideHtml() {
    var el = instance.getPopperElement(document.querySelector('#html-tippy'))
    instance.hide(el)
}
