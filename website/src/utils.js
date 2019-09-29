import redirects from './redirects';

export function sortActivePages(edges) {
  return [...edges]
    .sort((a, b) => a.node.frontmatter.index - b.node.frontmatter.index)
    .filter(({node}) => !redirects.has(node.frontmatter.path));
}

export const ALL_PLACEMENTS = ['top', 'right', 'bottom', 'left'].reduce(
  (acc, placement) => {
    return acc.concat(placement, `${placement}-start`, `${placement}-end`);
  },
  [],
);

export const EXTRA_ANIMATIONS = [
  'shift-away',
  'shift-toward',
  'scale',
  'perspective',
].reduce((acc, animation) => {
  return acc.concat(animation, `${animation}-subtle`, `${animation}-extreme`);
}, []);
