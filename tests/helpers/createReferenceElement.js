export default (append = false) => {
  const el = document.createElement('div')
  el.className = 'test'
  el.setAttribute('title', 'tooltip')
  el.cleanup = () => document.body.removeChild(el)
  if (append) document.body.appendChild(el)
  return el
}
