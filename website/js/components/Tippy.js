import { h, app } from 'hyperapp'
import tippy from '../../../dist/tippy.js'
import { isBrowser } from '../utils'

const Tippy = (realProps, [reference]) => {
  const props = {
    ...realProps,
    content: realProps.content || "I'm a Tippy tooltip"
  }

  if (props.content.constructor === Object && !props.target) {
    const container = isBrowser && document.createElement('div')
    app({}, {}, props.content, container)
    props.content = container
  }

  const update = element => {
    setTimeout(() => {
      element._tippy.set(props)
    }, 1)
  }

  return (
    <reference.nodeName
      {...reference.attributes}
      oncreate={element => !element._tippy && tippy(element, props)}
      onupdate={element => element._tippy && update(element)}
      ondestroy={element => element._tippy && element._tippy.destroy()}
    >
      {reference.children}
    </reference.nodeName>
  )
}

Tippy.secondary = (props, children) => (
  <Tippy
    {...props}
    arrow={true}
    animation="fade"
    appendTo={ref => ref.parentNode}
    theme="secondary"
  >
    {children}
  </Tippy>
)

export default Tippy
