var __tippyAddons__ = (function(exports, tippy$1) {
  'use strict'

  tippy$1 =
    tippy$1 && tippy$1.hasOwnProperty('default') ? tippy$1['default'] : tippy$1

  function _extends() {
    _extends =
      Object.assign ||
      function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i]

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key]
            }
          }
        }

        return target
      }

    return _extends.apply(this, arguments)
  }

  /**
   * Creates a delegate instance that controls the creation of tippy instances
   * for child elements (`target` CSS selector).
   * Port of v4's `target` prop to a separate function.
   */
  function delegate(targets, props) {
    {
      if (!props || !props.target) {
        throw new Error(
          '[tippy.js ERROR] You must specify a `target` prop indicating the ' +
            'CSS selector string matching the target elements that should ' +
            'receive a tippy.',
        )
      }
    }

    var listeners = []
    var childTippyInstances = []
    var target = props.target
    delete props.target
    var instanceOrInstances = tippy$1(targets, props)

    function onTrigger(event) {
      if (event.target) {
        var targetNode = event.target.closest(target)

        if (targetNode) {
          var instance = tippy$1(
            targetNode,
            _extends({}, props, {
              showOnInit: true,
            }),
          )

          if (instance) {
            childTippyInstances = childTippyInstances.concat(instance)
          }
        }
      }
    }

    function on(element, eventType, listener) {
      var options =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : false
      element.addEventListener(eventType, listener, options)
      listeners.push({
        element: element,
        eventType: eventType,
        listener: listener,
        options: options,
      })
    }

    function addEventListeners(instance) {
      var reference = instance.reference
      instance.props.trigger
        .trim()
        .split(' ')
        .forEach(function(eventType) {
          switch (eventType) {
            case 'mouseenter': {
              on(reference, 'mouseover', onTrigger)
              break
            }

            case 'focus': {
              on(reference, 'focusin', onTrigger)
              break
            }

            case 'click': {
              on(reference, 'click', onTrigger)
            }
          }
        })
    }

    function removeEventListeners(listeners) {
      listeners.forEach(function(_ref) {
        var element = _ref.element,
          eventType = _ref.eventType,
          listener = _ref.listener,
          options = _ref.options
        element.removeEventListener(eventType, listener, options)
      })
      listeners = []
    }

    function applyMutations(instance) {
      var originalDestroy = instance.destroy

      instance.destroy = function() {
        var shouldDestroyChildInstances =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : true

        if (shouldDestroyChildInstances) {
          childTippyInstances.forEach(function(instance) {
            instance.destroy()
          })
        }

        childTippyInstances = []
        removeEventListeners(listeners)
        originalDestroy()
      }

      addEventListeners(instance)
      instance.setProps({
        trigger: 'manual',
      })
    }

    if (instanceOrInstances) {
      if (Array.isArray(instanceOrInstances)) {
        var instances = instanceOrInstances
        instances.forEach(applyMutations)
      } else {
        var instance = instanceOrInstances
        applyMutations(instance)
      }
    }

    return instanceOrInstances
  }

  /**
   * Ponyfill for Array.from - converts iterable values to an array
   */

  var isBrowser =
    typeof window !== 'undefined' && typeof document !== 'undefined'
  var ua = isBrowser ? navigator.userAgent : ''
  var isIE = /MSIE |Trident\//.test(ua)
  var isUCBrowser = /UCBrowser\//.test(ua)
  var isIOS =
    isBrowser && /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream

  // Passive event listener config

  /**
   * Returns a value at a given index depending on if it's an array or number
   */

  function getValue(value, index, defaultValue) {
    if (Array.isArray(value)) {
      var v = value[index]
      return v == null ? defaultValue : v
    }

    return value
  }

  /**
   * Re-uses a single tippy element for many different tippy instances.
   * Replaces v4's `tippy.group()`.
   */

  function createSingleton(tippyInstances) {
    var optionalProps =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : {
            delay: 0,
          }

    {
      if (!Array.isArray(tippyInstances)) {
        if (!tippyInstances) {
          throw new Error(
            '[tippy.js ERROR] First argument to `createSingleton()` must ' +
              'be an array of tippy instances. The passed value was `' +
              tippyInstances +
              '`',
          ) // @ts-ignore
        } else if (
          tippyInstances.reference &&
          tippyInstances.reference._tippy
        ) {
          throw new Error(
            '[tippy.js ERROR] First argument to `createSingleton()` must ' +
              'be an *array* of tippy instances. The passed value was a ' +
              '*single* tippy instance.',
          )
        }
      }
    }

    var singletonInstance = tippy$1(document.createElement('div'))
    var delay = optionalProps.delay
    var showTimeout
    var hideTimeout

    function clearTimeouts() {
      clearTimeout(showTimeout)
      clearTimeout(hideTimeout)
    }

    tippyInstances.forEach(function(instance) {
      var _instance$props = instance.props,
        _onShow = _instance$props.onShow,
        _onTrigger = _instance$props.onTrigger,
        _onUntrigger = _instance$props.onUntrigger
      var originalClearDelayTimeouts = instance.clearDelayTimeouts

      instance.clearDelayTimeouts = function() {
        originalClearDelayTimeouts()
        clearTimeouts()
      }

      instance.setProps({
        delay: 0,
        onShow: function onShow(instance) {
          _onShow(instance)

          return false
        },
        onTrigger: function onTrigger(instance, event) {
          _onTrigger(instance, event)

          var props = _extends({}, instance.props)

          delete props.onShow
          delete props.delay
          singletonInstance.setProps(props)

          singletonInstance.reference.getBoundingClientRect = function() {
            return instance.reference.getBoundingClientRect()
          }

          clearTimeouts() // Edge case: if the tippy is currently hiding (but still mounted and
          // visible due to its opacity), it will slide to the new reference
          // element but fully to fade out before fading back in.
          // Also, we need to ensure the `popper` element doesn't set its
          // `transitionDuration` to 0ms, so it can transition smoothly

          if (
            !singletonInstance.state.isVisible &&
            singletonInstance.state.isMounted
          ) {
            singletonInstance.show(undefined, false)
          } else {
            showTimeout = setTimeout(function() {
              singletonInstance.show()
            }, getValue(delay, 0, tippy$1.defaultProps.delay))
          }
        },
        onUntrigger: function onUntrigger(instance, event) {
          _onUntrigger(instance, event)

          clearTimeouts()
          hideTimeout = setTimeout(function() {
            singletonInstance.hide()
          }, getValue(delay, 1, tippy$1.defaultProps.delay))
        },
      }) // Ensure the lifecycles functions are updateable

      var originalSetProps = instance.setProps

      instance.setProps = function(partialProps) {
        // Delay can't be updated
        delete partialProps.delay
        originalSetProps(partialProps)
        _onShow = partialProps.onShow || _onShow
        _onTrigger = partialProps.onTrigger || _onTrigger
        _onUntrigger = partialProps.onUntrigger || _onUntrigger
      }
    })
    var originalSetProps = singletonInstance.setProps

    singletonInstance.setProps = function(partialProps) {
      delay = partialProps.delay !== undefined ? partialProps.delay : delay
      originalSetProps(partialProps)
    }

    var originalDestroy = singletonInstance.destroy

    singletonInstance.destroy = function() {
      var shouldDestroyPassedInstances =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true

      if (shouldDestroyPassedInstances) {
        tippyInstances.forEach(function(instance) {
          instance.destroy()
        })
      }

      originalDestroy()
    }

    return singletonInstance
  }

  /* eslint-disable no-undef */

  if (typeof tippy === 'function') {
    tippy.delegate = delegate
    tippy.createSingleton = createSingleton
  } else {
    throw new Error(
      '[tippy.js ERROR] `tippy` is not a global function. Make sure you have ' +
        'included the tippy script before tippy-addons.',
    )
  }

  exports.createSingleton = createSingleton
  exports.delegate = delegate

  return exports
})({}, tippy)
//# sourceMappingURL=tippy-addons.js.map
