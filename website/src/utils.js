export function toKebabCase(str) {
  return (
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
      )
      .map(x => x.toLowerCase())
      .join('-')
  )
}

export function sortPagesByIndex(edges) {
  return [...edges].sort(
    (a, b) => a.node.frontmatter.index - b.node.frontmatter.index,
  )
}
