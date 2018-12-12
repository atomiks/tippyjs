import { h } from 'hyperapp'
import { toKebabCase } from '../utils'

const Subheading = scope => (props, children) => {
  const id = toKebabCase(
    scope + children.find(child => typeof child === 'string'),
  )
  return (
    <h3 id={id} class="section__subheading">
      <a href={'#' + id}>{children}</a>
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
    <div class="section__heading-wrapper">
      <h2 class="section__heading">{link}</h2>
    </div>
  )
}
