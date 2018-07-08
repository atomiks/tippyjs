```js
const virtualReference = {
  getBoundingClientRect() {
    return {
      width: 100,
      height: 100,
      top: 100,
      left: 100,
      right: 200,
      bottom: 200
    }
  },
  clientHeight: 100,
  clientWidth: 100
}

tippy(virtualReference, { content: "I'm a tooltip!" })
```
