import { h } from 'hyperapp'
import { toKebabCase } from '../utils'

const Subheading = scope => (props, children) => {
  const id = toKebabCase(scope + children[0])
  const link = <a href={'#' + id}>{children}</a>
  return (
    <h3 id={id} class="section__subheading">
      {link}
    </h3>
  )
}

export default (scope, children) => {
  if (typeof scope === 'string') {
    return Subheading(scope)
  }
  const id = toKebabCase(children[0])
  const link = <a href={'#' + id}>{children}</a>
  return (
    <div id={id} class="section__heading-wrapper">
      <h2 class="section__heading">{link}</h2>
    </div>
  )
}
