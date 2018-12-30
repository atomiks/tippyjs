```js
// Basic: won't hide tooltips with `hideOnClick: false`
window.addEventListener('scroll', tippy.hideAllPoppers)

// More control
window.addEventListener('scroll', () => {
  const poppers = [...document.querySelectorAll('.tippy-popper')]
  poppers.forEach(popper => {
    // If you pass `0` as the duration, you can make them hide instantly
    popper._tippy.hide(0)
  })
})
```
