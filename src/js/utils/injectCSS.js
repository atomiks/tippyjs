/**
* Injects CSS styles to document
* @param {String} css
*/
export default function injectCSS(css = '') {
  if (typeof window !== 'undefined') {
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
