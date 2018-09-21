```js
const template = document.querySelector('#myTemplate')
tippy(ref, {
  content: template,
  onShow() {
    // Don't show if the tippy content contains a <strong> element.
    if (template.querySelector('strong')) {
      return false
    }
  },
  onHide({ props }) {
    // Don't hide if the tooltip has an arrow.
    if (props.arrow) {
      return false
    }
  }
})
```
