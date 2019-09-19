/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 * **These should be gatsby plugins, but some weren't working.**
 * **For now I'm monkey-patching them...**
 */
import redirects from './src/redirects'

function redirect() {
  if (redirects.has(window.location.pathname)) {
    window.location.replace(redirects.get(window.location.pathname))
  }
}

export function onClientEntry() {
  redirect()
}
