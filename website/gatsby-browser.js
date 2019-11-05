/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import redirects from './src/redirects';
import config from './gatsby-config';

import './static/fonts.css';

function redirect() {
  const {pathname} = window.location;
  const {pathPrefix} = config;
  const prefix = pathname.indexOf(pathPrefix) !== -1 ? pathPrefix : '';
  const path = pathname.replace(pathPrefix, '');

  if (redirects.has(path)) {
    window.location.replace(prefix + redirects.get(path));
  }
}

export function onClientEntry() {
  redirect();
}
