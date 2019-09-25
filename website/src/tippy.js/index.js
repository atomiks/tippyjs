// This is temporary until v5 is on npm
import React, {
  forwardRef,
  cloneElement,
  useState,
  useLayoutEffect,
  useEffect,
  Children,
} from 'react'
import { createPortal } from 'react-dom'
import {
  createTippyWithPlugins,
  createSingleton,
  delegate,
  followCursor,
  animateFill,
} from '../../../'
import { useInstance } from '../hooks'
import '../../../dist/tippy.css'

const tippy = createTippyWithPlugins([followCursor, animateFill])

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

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

var useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

function Tippy({
  children,
  content,
  className,
  onBeforeUpdate,
  onAfterUpdate,
  onCreate,
  visible,
  enabled = true,
  multiple = true,
  ignoreAttributes = true,
  ...restOfNativeProps
}) {
  const isControlledMode = visible !== undefined

  const [mounted, setMounted] = useState(false)
  const component = useInstance(() => ({
    container: ssrSafeCreateDiv(),
    renders: 1,
  }))

  const props = {
    ignoreAttributes,
    multiple,
    ...restOfNativeProps,
    content: component.container,
  }

  if (isControlledMode) {
    props.trigger = 'manual'
  }

  // CREATE
  useIsomorphicLayoutEffect(() => {
    const instance = tippy(component.reference, props)

    component.instance = instance

    if (onCreate) {
      onCreate(instance)
    }

    if (!enabled) {
      instance.disable()
    }

    if (visible) {
      instance.show()
    }

    setMounted(true)

    return () => {
      instance.destroy()
    }
  }, [children.type])

  // UPDATE
  useIsomorphicLayoutEffect(() => {
    // Prevent this effect from running on the initial render
    if (component.renders === 1) {
      component.renders++
      return
    }

    if (onBeforeUpdate) {
      onBeforeUpdate(component.instance)
    }

    component.instance.setProps(props)

    if (onAfterUpdate) {
      onAfterUpdate(component.instance)
    }

    if (enabled) {
      component.instance.enable()
    } else {
      component.instance.disable()
    }

    if (isControlledMode) {
      if (visible) {
        component.instance.show()
      } else {
        component.instance.hide()
      }
    }
  })

  // UPDATE className
  useIsomorphicLayoutEffect(() => {
    if (className) {
      const tooltip = component.instance.popperChildren.tooltip
      updateClassName(tooltip, 'add', className)
      return () => {
        updateClassName(tooltip, 'remove', className)
      }
    }
  }, [className])

  return (
    <>
      {cloneElement(children, {
        ref(node) {
          component.reference = node
          preserveRef(children.ref, node)
        },
      })}
      {mounted && createPortal(content, component.container)}
    </>
  )
}

function TippySingleton({ children, ...props }) {
  const component = useInstance({ instances: [] })

  useIsomorphicLayoutEffect(() => {
    const { instances } = component
    const singleton = createSingleton([...instances], props)

    return () => {
      singleton.destroy()
      component.instances = instances.filter(i => !i.state.isDestroyed)
    }
  })

  return Children.map(children, child => {
    return cloneElement(child, {
      enabled: false,
      onCreate(instance) {
        if (child.props.onCreate) {
          child.props.onCreate(instance)
        }

        component.instances.push(instance)
      },
    })
  })
}

export default forwardRef(function TippyWrapper({ children, ...props }, ref) {
  return (
    <Tippy {...props}>
      {cloneElement(children, {
        ref(node) {
          preserveRef(ref, node)
          preserveRef(children.ref, node)
        },
      })}
    </Tippy>
  )
})

export { TippySingleton, tippy, createSingleton, delegate }
