```js
const button = document.querySelector('button')
const isIOS = /iPhone|iPad|iPod/.test(navigator.platform)

/*==================================================
Make iOS behave like Android (single tap to click)
==================================================*/
button.addEventListener('click', () => {
  // Your logic
})
tippy(button, {
  onShow() {
    if (isIOS) {
      button.click()
    }
  }
})

/*==================================================
Make Android behave like iOS (double tap to click)
==================================================*/
let isShown = false
tippy(button, {
  onShown() {
    isShown = true
  },
  onHide() {
    isShown = false
  }
})
button.addEventListener('click', () => {
  if (isIOS ? true : isShown) {
    // Your logic
  }
})
```
