```js
function onImageDimensionsKnown(img, callback) {
  const interval = setInterval(() => {
    if (img.naturalWidth) {
      clearInterval(interval)
      callback()
    }
  })
  // Clean up if the image dimensions fail to be known
  setTimeout(() => {
    clearInterval(interval)
  }, 1000)
}

// Usage:
onImageDimensionsKnown(img, () => {
  tip.setContent(img)
})
```
