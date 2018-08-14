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
        tip.setContent(`<img width="200" height="200" src="${url}" />`)
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
