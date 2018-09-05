```js
tippy(ref, {
  wait(tip, event) {
    // Delay by 200ms if
    // trigger was not focus
    setTimeout(
      tip.show,
      event.type === 'focus'
        ? 0
        : 200
    )
})
```
