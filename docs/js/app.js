function $(s) {
  return document.querySelector(s)
}

function hideHtml() {
    var popper = htmlTip.getPopperElement($('#html-tippy'))
    var nestedPopper = instance.getPopperElement($('.btn-danger[onclick]'))
    instance.hide(nestedPopper, 100)
    htmlTip.hide(popper)
}

var DOM = {
  performance: {
    btn: $('#performance-btn'),
    result: $('#performance-result'),
    test: $('#performance-test'),
    model: $('#performance-model')
  },
  ajax: {
    btn: $('#ajax-btn'),
    template: $('#ajax-template')
  }
}

// The main instance which most tooltips are created by
var instance = tippy('.tippy')
// Show the animated tippy on load
instance.show(instance.getPopperElement($('#animated-tippy')))

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

// HTML & nested tooltip example
var template = $('#template')
var htmlTip = tippy('#html-tippy', {
  html: template,
  shown: function() {
    if (window.innerWidth < 976) {
      var nestedRefEl = template.querySelector('.btn')
      instance.show(instance.getPopperElement(nestedRefEl))
    }
  }
})

// Ajax tooltip
var $ajax = DOM.ajax
var ajaxInitialText = $ajax.template.innerHTML
var tip = tippy($ajax.btn, {
    flipDuration: 0,
    arrow: true,
    html: $ajax.template,
    theme: 'light',
    arrowSize: 'big',
    animation: 'perspective',
    show: function() {
        if (tip.loading || $ajax.template.innerHTML !== ajaxInitialText) return

        tip.loading = true

        fetch('https://unsplash.it/200/?random').then(function(resp) {
            return resp.blob()
        }).then(function(blob) {
          var refData = tip.getReferenceData($ajax.btn)
          var url = URL.createObjectURL(blob)
          $ajax.template.innerHTML = '<img width="200" height="200" src="' + url + '">'
          tip.loading = false

          refData.popperInstance.update()
        }).catch(function(err) {
          var refData = tip.getReferenceData($ajax.btn)

          tip.loading = false
          $ajax.template.innerHTML = 'There was an error loading the image'

          refData.popperInstance.update()

          setTimeout(function() {
            $ajax.template.innerHTML = ajaxInitialText
          }, 1000)
        })
    },
    hidden: function() {
      $ajax.template.innerHTML = ajaxInitialText
    },
    popperOptions: {
      modifiers: {
        preventOverflow: {
          enabled: false
        },
        hide: {
          enabled: false
        }
      }
    }
})

// Performance section
var $perf = DOM.performance
var jsperf = (function() {
    var i = 1
    var base = 200
    var counter = base
    var tippyTime = 0
    var instance

    return {
        updateModel: function() {
            var value = parseInt($perf.model.value) || 1
            $perf.btn.innerHTML = 'Append ' + value + (value === 1 ? ' element!' : ' elements!')

            instance && instance.destroyAll()

            this.reset(value)
        },
        reset: function(value) {
            i = 1
            tippyTime = 0
            counter = base = value
            $perf.test.innerHTML = $perf.result.innerHTML = ''
        },
        run: function() {
            for (i; i <= counter; i++) {
                var el = document.createElement('div')
                el.title = 'Performance test'
                el.className = 'test-element'
                el.innerHTML = '#' + i
                $perf.test.appendChild(el)
            }

            counter += base

            var t1 = performance.now()
            instance = tippy('.test-element', {
                animation: 'perspective',
                hideOnClick: false,
                duration: 200,
                arrow: true,
                performance: true,
                theme: 'transparent',
                size: 'small',
                arrowSize: 'small'
            })
            var t2 = performance.now()

            tippyTime += (t2 - t1)

            var innerHTML = '<p><strong>In total, Tippy instantiation has taken</strong> ' + tippyTime.toFixed(1) + ' milliseconds</p>' +
            '<p><strong>Current Tippy instantiation took</strong> ' + (t2 - t1).toFixed(1) + ' milliseconds</p>' +
            '<p><strong>Elements appended so far:</strong> ' + (counter - base) + '</p><hr>'

            $perf.result.innerHTML = innerHTML
        }
    }
})()
$perf.model.addEventListener('input', jsperf.updateModel.bind(jsperf))
$perf.btn.addEventListener('click', jsperf.run)
jsperf.updateModel()
