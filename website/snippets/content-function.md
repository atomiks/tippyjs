```js
tippy('button', {
  content(reference) {
    return document.getElementById(reference.getAttribute('data-template'))
  }
})
```
