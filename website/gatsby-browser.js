/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import redirects from './src/redirects'

import './static/fonts.css'

function redirect() {
  if (redirects.has(window.location.pathname)) {
    window.location.replace(redirects.get(window.location.pathname))
  }
}

export function onClientEntry() {
  redirect()
}
