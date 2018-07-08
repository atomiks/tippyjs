const isShallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) {
    return true
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.lentth) {
    return false
  }

  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

const cache = new WeakMap()

export default (props, children) => {
  const prev = cache.get(props.render)
  if (prev && isShallowEqual(prev.props, props)) {
    return prev.node
  }
  const next = { node: props.render(props, children), props }
  cache.set(props.render, next)
  return next.node
}
