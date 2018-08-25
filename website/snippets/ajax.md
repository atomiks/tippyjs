```js
const INITIAL_CONTENT = 'Loading...'

const state = {
  isFetching: false,
  canFetch: true
}

tippy('#ajax-tippy', {
  content: INITIAL_CONTENT,
  async onShow(tip) {
    if (state.isFetching || !state.canFetch) return

    state.isFetching = true
    state.canFetch = false

    try {
      const response = await fetch('https://unsplash.it/200/?random')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      if (tip.state.isVisible) {
        const img = new Image()
        img.width = 200
        img.height = 200
        img.src = url
        tip.setContent(img)
      }
    } catch (e) {
      tip.setContent(`Fetch failed. ${e}`)
    } finally {
      state.isFetching = false
    }
  },
  onHidden(tip) {
    state.canFetch = true
    tip.setContent(INITIAL_CONTENT)
  }
})
```
