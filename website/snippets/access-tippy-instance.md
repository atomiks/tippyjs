```js
const buttonEl = document.querySelector('button')

// #1
// The `_tippy` property on the element.
tippy(buttonEl)
const tip = buttonEl._tippy

// #2
// The return value from the `tippy.one()` static method.
const tip = tippy.one(buttonEl)

// #3
// For auto-initialized tooltips using the `data-tippy` attribute,
// ensure access to the instance is deferred with `setTimeout()`
// if you need to access it immediately at runtime.
setTimeout(() => {
  const tip = buttonEl._tippy
})
```
