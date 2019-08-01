import { isBrowser } from './browser'

/**
 * Injects a string of CSS styles to a style node in <head>
 */
export function injectCSS(css: string): void {
  if (isBrowser) {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.textContent = css
    style.setAttribute('data-__NAMESPACE_PREFIX__-stylesheet', '')
    const head = document.head
    const firstStyleOrLinkTag = head.querySelector('style,link')

    if (firstStyleOrLinkTag) {
      head.insertBefore(style, firstStyleOrLinkTag)
    } else {
      head.appendChild(style)
    }
  }
}
