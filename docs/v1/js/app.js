function $(s) {
  return document.querySelector(s)
}

function hideHtml() {
  var popper = htmlTip.getPopperElement($('#html-tippy'))
  var nestedPopper = instance.getPopperElement($('.btn-danger[onclick]'))
  instance.hide(nestedPopper, 100)
  htmlTip.hide(popper)
}

// Leave out filter CSS for Safari since it's buggy
if (window.safari) {
  document.body.classList.add('is-safari')
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
  onShown: function () {
    alert('Hello from the onShown() callback!')
    document.getElementById('callback-tippy').blur()
  }
})

// HTML & nested tooltip example
var template = $('#template')
var htmlTip = tippy('#html-tippy', {
  html: template,
  onShown: function () {
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
  onShow: function () {
    if (!window.fetch) {
      $ajax.template.innerHTML = 'Your browser does not support window.fetch()'
      return
    }

    if (tip.loading || $ajax.template.innerHTML !== ajaxInitialText) return

    tip.loading = true

    fetch('https://unsplash.it/200/?random', { mode: 'cors' }).then(function(resp) {
      return resp.blob()
    }).then(function (blob) {
      var url = URL.createObjectURL(blob)
      $ajax.template.innerHTML = '<img width="200" height="200" src="' + url + '">'
      tip.loading = false
    }).catch(function (err) {
      tip.loading = false
      $ajax.template.innerHTML = 'There was an error loading the image'

      setTimeout(function () {
        $ajax.template.innerHTML = ajaxInitialText
      }, 2000)
    })
  },
  onHidden: function () {
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
var jsperf = (function () {
  var i = 1
  var base = 200
  var counter = base
  var tippyTime = 0
  var instance

  return {
    updateModel: function () {
      var value = parseInt($perf.model.value) || 1
      $perf.btn.innerHTML = 'Append ' + value + (value === 1 ? ' element!' : ' elements!')

      instance && instance.destroyAll()

      this.reset(value)
    },
    reset: function (value) {
      i = 1
      tippyTime = 0
      counter = base = value
      $perf.test.innerHTML = $perf.result.innerHTML = ''
    },
    run: function () {
      for (i; i <= counter; i++) {
        var el = document.createElement('div')
        el.title = 'Performance test'
        el.className = 'test-element'
        el.innerHTML = i
        $perf.test.appendChild(el)
      }

      counter += base

      var t1 = performance.now()
      instance = tippy('.test-element', {
        hideOnClick: false,
        duration: 0,
        arrow: true,
        performance: true
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
