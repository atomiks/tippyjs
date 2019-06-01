import redirects from './redirects'

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

export function sortActivePages(edges) {
  return [...edges]
    .sort((a, b) => a.node.frontmatter.index - b.node.frontmatter.index)
    .filter(({ node }) => !redirects.has(node.frontmatter.path))
}

export const ALL_PLACEMENTS = ['top', 'right', 'bottom', 'left'].reduce(
  (acc, placement) => {
    return acc.concat(placement, `${placement}-start`, `${placement}-end`)
  },
  [],
)

export const EXTRA_ANIMATIONS = [
  'shift-away',
  'shift-toward',
  'scale',
  'perspective',
].reduce((acc, animation) => {
  return acc.concat(animation, `${animation}-subtle`, `${animation}-extreme`)
}, [])
