```js
tippy(ref, {
  content(reference) {
    return document.getElementById(reference.getAttribute('data-template'))
  }
})
```
