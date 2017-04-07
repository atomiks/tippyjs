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

new Tippy('.flippy', {
    position: 'right',
    animation: 'fade',
    arrow: true,
    popperOptions: {
        modifiers: {
            flip: {
                behavior: ['right', 'bottom']
            }
        }
    }
})

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
