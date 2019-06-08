/**!
 * tippy.js v5.0.0-alpha.1
 * (c) 2017-2019 atomiks
 * MIT License
 */
import {
  a as throwErrorWhen,
  t as tippy,
  _ as _extends,
  h as hasOwnProperty,
  g as getValue,
} from '../../esm/tippy.chunk.js'
import 'popper.js'

/**
 * Creates a delegate instance that controls the creation of tippy instances
 * for child elements (`target` CSS selector).
 * Port of v4's `target` prop to a separate function.
 */
function delegate(targets, props) {
  if (process.env.NODE_ENV !== 'production') {
    throwErrorWhen(
      !props || !props.target,
      'You must specify a `target` prop indicating the CSS selector string ' +
        'matching the target elements that should receive a tippy.',
    )
  }

  var listeners = []
  var childTippyInstances = []
  var target = props.target
  delete props.target
  var instanceOrInstances = tippy(targets, props)

  function onTrigger(event) {
    if (event.target) {
      var targetNode = event.target.closest(target)

      if (targetNode) {
        var instance = tippy(
          targetNode,
          _extends({}, props, {
            showOnCreate: true,
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
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false
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
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true

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

  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(tippyInstances)) {
      throwErrorWhen(
        !tippyInstances,
        'First argument to `createSingleton()` must be an array of tippy ' +
          'instances. The passed value was `' +
          tippyInstances +
          '`',
      )
      throwErrorWhen(
        // @ts-ignore
        tippyInstances.reference && tippyInstances.reference._tippy,
        'First argument to `createSingleton()` must be an *array* of tippy ' +
          'instances. The passed value was a *single* tippy instance.',
      )
    }

    var isAnyInstancePartOfExistingSingleton = tippyInstances.some(function(
      instance,
    ) {
      return hasOwnProperty(instance, '__singleton__')
    })
    throwErrorWhen(
      isAnyInstancePartOfExistingSingleton,
      'The passed tippy instance(s) are already part of an existing ' +
        'singleton instance. Make sure you destroy the previous singleton ' +
        'before calling `createSingleton()` again.',
    )
    tippyInstances.forEach(function(instance) {
      instance.__singleton__ = true
    })
  }

  var singletonInstance = tippy(document.createElement('div'))
  var delay = optionalProps.delay
  var showTimeout
  var hideTimeout

  var _onTrigger

  var _onUntrigger

  function clearTimeouts() {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  tippyInstances.forEach(function(instance) {
    // To prevent bugs with `hideOnClick`, we need to let the original tippy
    // instance also go through its lifecycle (i.e. be mounted to the DOM as
    // well). To prevent it from being seen/overlayed over the singleton
    // tippy, we can set its opacity to 0
    instance.popper.style.opacity = '0'
    _onTrigger = instance.props.onTrigger
    _onUntrigger = instance.props.onUntrigger
    var originalClearDelayTimeouts = instance.clearDelayTimeouts

    instance.clearDelayTimeouts = function() {
      originalClearDelayTimeouts()
      clearTimeouts()
    }

    instance.setProps({
      delay: 0,
      onTrigger: function onTrigger(instance, event) {
        _onTrigger(instance, event)

        var props = _extends({}, instance.props)

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
          }, getValue(delay, 0, tippy.defaultProps.delay))
        }
      },
      onUntrigger: function onUntrigger(instance, event) {
        _onUntrigger(instance, event)

        clearTimeouts()
        hideTimeout = setTimeout(function() {
          singletonInstance.hide()
        }, getValue(delay, 1, tippy.defaultProps.delay))
      },
    }) // Ensure the lifecycles functions are updateable

    var originalSetProps = instance.setProps

    instance.setProps = function(partialProps) {
      // `delay` can't be updated
      delete partialProps.delay
      originalSetProps(partialProps)
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
    tippyInstances.forEach(function(instance) {
      // Reset the original lifecycle hooks to prevent stack overflow if
      // calling again.
      // Note: users must always destroy the singleton instance before calling
      // `createSingleton()` again on the same instances.
      instance.setProps({
        onTrigger: _onTrigger,
        onUntrigger: _onUntrigger,
      })

      if (process.env.NODE_ENV !== 'production') {
        delete instance.__singleton__
      }

      if (shouldDestroyPassedInstances) {
        instance.destroy()
      }
    })
    originalDestroy()
  }

  return singletonInstance
}

export { createSingleton, delegate }
//# sourceMappingURL=tippy-addons.js.map
