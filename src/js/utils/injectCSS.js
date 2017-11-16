/**
* Injects CSS styles to document
* @param {String} css
*/
export default function injectCSS(css = '') {
  const head = document.head || document.querySelector('head')
  const style = document.createElement('style')
  style.type = 'text/css'
  head.appendChild(style)
  
  if (style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }
}
