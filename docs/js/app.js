function $(s) {
  return document.querySelector(s)
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

tippy('.tippy', {
  createPopperInstanceOnInit: !!window.safari
})

tippy('.flippy', {
  placement: 'right',
  animation: 'fade',
  arrowType: 'round',
  arrow: true,
  flipBehavior: ['right', 'bottom']
})

tippy('.tippy-link', {
  theme: 'translucent',
  arrow: true,
  arrowType: 'round',
  arrowTransform: 'translateY(0.7px)',
  animation: 'fade'
})

// Callbacks
tippy('#onShow', {
  onShow: function () {
    console.log('onShow called!')
  }
})
tippy('#onHide', {
  onHide: function () {
    console.log('onHide called!')
  }
})
tippy('#onShown', {
  onShown: function () {
    console.log('onShown called!')
  }
})
tippy('#onHidden', {
  onHidden: function () {
    console.log('onHidden called!')
  }
})

// HTML & nested tooltip example
function closeHtml() {
  $('#html-tippy')._tippy.hide()
}
var template = $('#template')
var htmlTip = tippy('#html-tippy', {
  html: template,
  onShown: function () {
    if (tippy.browser.usingTouch) {
      template.querySelector('.btn')._tippy.show()
    }
  },
  onHide: function () {
    this.querySelector('.btn')._tippy.hide(75)
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

    fetch('https://unsplash.it/200/?random', { mode: 'cors' }).then(function (resp) {
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
  var base = 100
  var counter = base
  var tippyTime = 0
  var tooltips = []

  return {
    updateModel: function () {
      var value = parseInt($perf.model.value) || 1
      $perf.btn.innerHTML = 'Append ' + value + (value === 1 ? ' element!' : ' elements!')

      if (tooltips.length) {
        tooltips.destroyAll()
      }

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
      tip = tippy('.test-element', {
        hideOnClick: false,
        duration: 0,
        arrow: true,
        performance: true,
        animation: 'fade'
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
