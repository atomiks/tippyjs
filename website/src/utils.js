import {version} from '../../package.json';

export const CURRENT_MAJOR = `v${version.split('.')[0]}`;
export const HOME_PATHS = ['/', '/tippyjs/'];

export function sortActivePages(edges) {
  return [...edges].sort(
    (a, b) => a.node.frontmatter.index - b.node.frontmatter.index,
  );
}

export function getVersionFromPath(path) {
  return (path.match(/\/(v\d+?)\//) || [null, CURRENT_MAJOR])[1];
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
