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
// Useful function for dynamically determining the input type:
// https://github.com/30-seconds/30-seconds-of-code#onuserinputchange
let isUsingTouch = false
onUserInputChange(type => {
  isUsingTouch = type === 'touch'
})

const tip = tippy.one(button)
button.addEventListener('click', () => {
  if (isIOS || !isUsingTouch ? true : tip.state.isShown) {
    // Your logic
  }
})
```
