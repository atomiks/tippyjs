import { isBrowser, browser } from '../core/globals'

/**
 * Injects CSS styles to document head
 * @param {String} css
 */
export default function injectCSS(css = '') {
  if (isBrowser && browser.supported) {
    const head = document.head || document.querySelector('head')
    const style = document.createElement('style')
    style.type = 'text/css'
    head.insertBefore(style, head.firstChild)

    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }
  }
}
