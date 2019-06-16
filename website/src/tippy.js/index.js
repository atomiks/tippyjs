// This is temporary until v5 is on npm
import React, {
  forwardRef,
  cloneElement,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  Children,
} from 'react'
import { createPortal } from 'react-dom'
import tippy from '../../../'
import { createSingleton, delegate } from '../../../addons'

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {}
  var target = {}
  var sourceKeys = Object.keys(source)
  var key, i

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i]
    if (excluded.indexOf(key) >= 0) continue
    target[key] = source[key]
  }

  return target
}

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
function preserveRef(ref, node) {
  if (ref) {
    if (typeof ref === 'function') {
      ref(node)
    }

    if ({}.hasOwnProperty.call(ref, 'current')) {
      ref.current = node
    }
  }
}
function ssrSafeCreateDiv() {
  return isBrowser && document.createElement('div')
}
function updateClassName(tooltip, action, classNames) {
  classNames.split(/\s+/).forEach(function(name) {
    if (name) {
      tooltip.classList[action](name)
    }
  })
}

// get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect because we want Tippy
// to perform sync mutations to the DOM elements after renders to prevent
// jitters/jumps, especially when updating content.

var useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

function Tippy(_ref) {
  var children = _ref.children,
    content = _ref.content,
    className = _ref.className,
    onCreate = _ref.onCreate,
    isVisible = _ref.isVisible,
    isEnabled = _ref.isEnabled,
    visible = _ref.visible,
    enabled = _ref.enabled,
    _ref$ignoreAttributes = _ref.ignoreAttributes,
    ignoreAttributes =
      _ref$ignoreAttributes === void 0 ? true : _ref$ignoreAttributes,
    _ref$multiple = _ref.multiple,
    multiple = _ref$multiple === void 0 ? true : _ref$multiple,
    restOfNativeProps = _objectWithoutPropertiesLoose(_ref, [
      'children',
      'content',
      'className',
      'onCreate',
      'isVisible',
      'isEnabled',
      'visible',
      'enabled',
      'ignoreAttributes',
      'multiple',
    ])

  // `isVisible` / `isEnabled` renamed to `visible` / `enabled`
  enabled =
    enabled !== undefined ? enabled : isEnabled !== undefined ? isEnabled : true
  visible = visible !== undefined ? visible : isVisible

  var _useState = useState(false),
    mounted = _useState[0],
    setMounted = _useState[1]

  var containerRef = useRef(ssrSafeCreateDiv())
  var targetRef = useRef()
  var instanceRef = useRef()
  var isControlledMode = visible !== undefined

  var options = _extends(
    {
      ignoreAttributes: ignoreAttributes,
      multiple: multiple,
    },
    restOfNativeProps,
    {
      content: containerRef.current,
    },
  )

  if (isControlledMode) {
    options.trigger = 'manual'
  }

  useIsomorphicLayoutEffect(function() {
    instanceRef.current = tippy(targetRef.current, options)

    if (onCreate) {
      onCreate(instanceRef.current)
    }

    if (!enabled) {
      instanceRef.current.disable()
    }

    if (visible) {
      instanceRef.current.show()
    }

    setMounted(true)
    return function() {
      instanceRef.current.destroy()
      instanceRef.current = null
    }
  }, [])
  useIsomorphicLayoutEffect(function() {
    if (!mounted) {
      return
    }

    instanceRef.current.setProps(options)

    if (enabled) {
      instanceRef.current.enable()
    } else {
      instanceRef.current.disable()
    }

    if (isControlledMode) {
      if (visible) {
        instanceRef.current.show()
      } else {
        instanceRef.current.hide()
      }
    }
  })
  useIsomorphicLayoutEffect(
    function() {
      if (className) {
        var tooltip = instanceRef.current.popperChildren.tooltip
        updateClassName(tooltip, 'add', className)
        return function() {
          updateClassName(tooltip, 'remove', className)
        }
      }
    },
    [className],
  )
  return React.createElement(
    React.Fragment,
    null,
    cloneElement(children, {
      ref: function ref(node) {
        targetRef.current = node
        preserveRef(children.ref, node)
      },
    }),
    mounted && createPortal(content, containerRef.current),
  )
}

var Tippy$1 = forwardRef(function TippyWrapper(_ref2, _ref3) {
  var children = _ref2.children,
    props = _objectWithoutPropertiesLoose(_ref2, ['children'])

  return React.createElement(
    Tippy,
    props,
    cloneElement(children, {
      ref: function ref(node) {
        preserveRef(_ref3, node)
        preserveRef(children.ref, node)
      },
    }),
  )
})

function TippySingleton({ children, delay }) {
  const instancesRef = useRef([])

  useEffect(() => {
    const singleton = createSingleton(instancesRef.current, { delay })
    return () => {
      singleton.destroy(false)
    }
  }, [delay])

  return Children.map(children, child => {
    return cloneElement(child, {
      onCreate(instance) {
        if (child.props.onCreate) {
          child.props.onCreate(instance)
        }

        instancesRef.current.push(instance)
      },
    })
  })
}

export default Tippy$1
export { TippySingleton, tippy, createSingleton, delegate }
