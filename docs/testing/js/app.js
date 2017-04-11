function hideHtml() {
    var popper = instance.getPopperElement(document.querySelector('#html-tippy'))
    instance.hide(popper)
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

var instance = new Tippy('.tippy')

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

new Tippy('#callback-tippy', {
    shown: function() {
        alert('Hello from the shown() callback!')
        document.getElementById('callback-tippy').blur()
    }
})

var performanceTest = document.getElementById('performance-test')
var performanceResult = document.getElementById('performance-result')
var performanceBtn = document.getElementById('performance-btn')
var performanceModel = document.getElementById('performance-model')

var jsperf = (function() {
    var i = 1
    var base = 20
    var counter = base
    var tippyTime = 0

    return {
        updateModel: function() {
            var value = parseInt(performanceModel.value) || 1
            performanceBtn.innerHTML = 'Append ' + value + (value === 1 ? ' element!' : ' elements!')
            jsperf.reset(value)
        },
        reset: function(value) {
            i = 1
            tippyTime = 0
            counter = base = value
            performanceTest.innerHTML = performanceResult.innerHTML = ''
            if (value > 1000) {
                performanceResult.innerHTML = "You probably shouldn't do that, but it's your choice ¯\\_(ツ)_/¯"
            }
        },
        run: function() {
            for (i; i <= counter; i++) {
                var el = document.createElement('div')
                el.setAttribute('title', 'Performance test')
                el.setAttribute('class', 'test-element')
                el.innerHTML = '#' + i
                performanceTest.appendChild(el)
            }

            counter += base

            var t1 = performance.now()
            new Tippy('.test-element', {
                animation: 'scale',
                duration: 200,
                arrow: true
            })
            var t2 = performance.now()

            tippyTime += (t2 - t1)

            var innerHTML = '<p><strong>In total, Tippy instantiation has taken</strong> ' + tippyTime.toFixed(1) + ' milliseconds</p>' +
            '<p><strong>Current Tippy instantiation took</strong> ' + (t2 - t1).toFixed(1) + ' milliseconds</p>' +
            '<p><strong>Elements appended so far:</strong> ' + (counter - base) + '</p><hr>'

            performanceResult.innerHTML = innerHTML
        }
    }
})()
performanceModel.addEventListener('keyup', jsperf.updateModel)
performanceBtn.addEventListener('click', jsperf.run)
jsperf.updateModel()
