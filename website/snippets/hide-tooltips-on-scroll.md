```js
window.addEventListener('scroll', () => {
  Array.from(document.querySelectorAll('.tippy-popper')).forEach(popper => {
    popper._tippy.hide()
  })
})
```
