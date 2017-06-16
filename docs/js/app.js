function hideHtml() {
    var popper = instance.getPopperElement(document.querySelector('#html-tippy'))
    instance.hide(popper)
}

var instance = tippy('.tippy')
instance.show(instance.getPopperElement(document.querySelector('#animated-tippy')))

tippy('.flippy', {
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

tippy('.tippy-link', {
    theme: 'transparent',
    arrow: true,
    animation: 'fade'
})

tippy('#callback-tippy', {
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
    var base = 200
    var counter = base
    var tippyTime = 0
    var instance

    return {
        updateModel: function() {
            var value = parseInt(performanceModel.value) || 1
            performanceBtn.innerHTML = 'Append ' + value + (value === 1 ? ' element!' : ' elements!')

            instance && instance.destroyAll()

            this.reset(value)
        },
        reset: function(value) {
            i = 1
            tippyTime = 0
            counter = base = value
            performanceTest.innerHTML = performanceResult.innerHTML = ''
        },
        run: function() {
            for (i; i <= counter; i++) {
                var el = document.createElement('div')
                el.title = 'Performance test'
                el.className = 'test-element'
                el.innerHTML = '#' + i
                performanceTest.appendChild(el)
            }

            counter += base

            var t1 = performance.now()
            instance = tippy('.test-element', {
                animation: 'scale',
                duration: 200,
                arrow: true,
                performance: true
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
performanceModel.addEventListener('input', jsperf.updateModel.bind(jsperf))
performanceBtn.addEventListener('click', jsperf.run)
jsperf.updateModel()
