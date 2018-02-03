export default (append = false) => {
  const el = document.createElement('div')
  el.className = 'TEST'
  el.setAttribute('title', 'TOOLTIP')
  Object.assign(el, {
    _selector: '.TEST',
    _title: 'TOOLTIP'
  })
  if (append) document.body.appendChild(el)
  return el
}
