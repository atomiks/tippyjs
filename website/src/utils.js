import React from 'react';
import {version} from '../../package.json';

export const CURRENT_MAJOR = `v${version.split('.')[0]}`;
export const HOME_PATHS = ['/', '/tippyjs/'];
export const BOLD_HELLO = <strong>Hello</strong>;

function shouldShowLink(path, currentPath) {
  const version = getVersionFromPath(path);

  // Default to latest docs
  if (HOME_PATHS.includes(currentPath)) {
    return path.includes(CURRENT_MAJOR);
  }

  return currentPath.includes(version);
}

export function sortActivePages(edges, location) {
  return [...edges]
    .sort((a, b) => a.node.frontmatter.index - b.node.frontmatter.index)
    .filter(
      ({node}) =>
        shouldShowLink(node.frontmatter.path, location.pathname) ||
        (HOME_PATHS.includes(node.frontmatter.path) &&
          getVersionFromPath(location.pathname) === CURRENT_MAJOR)
    );
}

export function getVersionFromPath(path) {
  return (path.match(/\/(v\d+?)\//) || [null, CURRENT_MAJOR])[1];
}

export const ALL_PLACEMENTS = ['top', 'right', 'bottom', 'left'].reduce(
  (acc, placement) => {
    return acc.concat(placement, `${placement}-start`, `${placement}-end`);
  },
  []
);

export const EXTRA_ANIMATIONS = [
  'shift-away',
  'shift-toward',
  'scale',
  'perspective',
].reduce((acc, animation) => {
  return acc.concat(animation, `${animation}-subtle`, `${animation}-extreme`);
}, []);
