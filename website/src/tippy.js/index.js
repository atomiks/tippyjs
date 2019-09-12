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
import tippyBase from '../../../'
import { createSingleton, delegate } from '../../../addons'
import enhance, { followCursor } from '../../../extra-props'
import { useThis } from '../hooks'
import '../../../tippy.css'

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

const tippy = enhance(tippyBase, [followCursor])

createSingleton.tippy = tippy
delegate.tippy = tippy

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
  const $this = useThis({ container: ssrSafeCreateDiv(), renders: 1 })

  const props = {
    ignoreAttributes,
    multiple,
    ...restOfNativeProps,
    content: $this.container,
  }

  if (isControlledMode) {
    props.trigger = 'manual'
  }

  // CREATE
  useIsomorphicLayoutEffect(() => {
    const instance = tippy($this.reference, props)

    $this.instance = instance

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
  }, [])

  // UPDATE
  useIsomorphicLayoutEffect(() => {
    // Prevent this effect from running on the initial render, and the render
    // caused by setMounted().
    if ($this.renders < 3) {
      $this.renders++
      return
    }

    if (onBeforeUpdate) {
      onBeforeUpdate($this.instance)
    }

    $this.instance.setProps(props)

    if (onAfterUpdate) {
      onAfterUpdate($this.instance)
    }

    if (enabled) {
      $this.instance.enable()
    } else {
      $this.instance.disable()
    }

    if (isControlledMode) {
      if (visible) {
        $this.instance.show()
      } else {
        $this.instance.hide()
      }
    }
  })

  // UPDATE className
  useIsomorphicLayoutEffect(() => {
    if (className) {
      const tooltip = $this.instance.popperChildren.tooltip
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
          $this.reference = node
          preserveRef(children.ref, node)
        },
      })}
      {mounted && createPortal(content, $this.container)}
    </>
  )
}

function TippySingleton({ children, delay }) {
  const $this = useThis({ instances: [] })

  useEffect(() => {
    const singleton = createSingleton($this.instances, { delay })
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

        $this.instances.push(instance)
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
