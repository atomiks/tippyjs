function hideHtml() {
    var popper = instance.getPopperElement(document.querySelector('#html-tippy'))
    instance.hide(popper)
}

function toggle(e) {
    var popper = instance.getPopperElement(document.getElementById('neighbor-tippy'))
    popper.style.visibility === 'visible' ? instance.hide(popper) : instance.show(popper)
}

function destroy(e) {
    var popper = instance.getPopperElement(document.getElementById('neighbor-tippy'))
    instance.destroy(popper)
    var toggler = document.getElementById('toggle-tippy')
    toggler.setAttribute('disabled', '')
    toggler.removeEventListener('click', toggle)
    e.target.setAttribute('disabled', '')
    e.target.removeEventListener('click', destroy)
}

function update(e) {
    var template = document.getElementById('manual-template')
    var btn1 = document.getElementById('title-neighbor-tippy')
    var btn2 = document.getElementById('html-neighbor-tippy')

    btn1.title = 'Updated'
    template.querySelector('h2').innerHTML = 'DOG!'
    var img = template.querySelector('img')
    img.width = 270
    img.src = 'https://i.ytimg.com/vi/opKg3fyqWt4/hqdefault.jpg'

    var popper1 = instance.getPopperElement(btn1)
    var popper2 = instance.getPopperElement(btn2)
    instance.update(popper1)
    instance.update(popper2)

    e.target.innerHTML = 'Updated'
    e.target.setAttribute('disabled', '')
}

var instance = Tippy('.tippy')
instance.show(instance.getPopperElement(document.querySelector('#animated-tippy')))

Tippy('.flippy', {
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

Tippy('.tippy-link', {
    theme: 'transparent',
    arrow: true,
    animation: 'fade'
})

Tippy('#callback-tippy', {
    shown: function() {
        alert('Hello from the shown() callback!')
        document.getElementById('callback-tippy').blur()
    }
})

document.getElementById('toggle-tippy').addEventListener('click', toggle)
document.getElementById('destroy-tippy').addEventListener('click', destroy)
document.getElementById('update-tippy').addEventListener('click', update)

var performanceTest = document.getElementById('performance-test')
var performanceResult = document.getElementById('performance-result')
var performanceBtn = document.getElementById('performance-btn')
var performanceModel = document.getElementById('performance-model')

var jsperf = (function() {
    var i = 1
    var base = 200
    var counter = base
    var tippyTime = 0

    return {
        updateModel: function() {
            var value = parseInt(performanceModel.value) || 1
            performanceBtn.innerHTML = 'Append ' + value + (value === 1 ? ' element!' : ' elements!')

            var els = [].slice.call(performanceTest.querySelectorAll('.test-element'))
            els.forEach(function(el) {
                var popper = instance.getPopperElement(el)
                instance.destroy(popper)
            })

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
            Tippy('.test-element', {
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
performanceModel.addEventListener('input', jsperf.updateModel.bind(jsperf))
performanceBtn.addEventListener('click', jsperf.run)
jsperf.updateModel()
