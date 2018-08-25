export default {
  ajax: {
    onShow: () => (state, actions) => {
      if (state.isFetching || !state.canFetch) return

      fetch('https://unsplash.it/200/?random')
        .then(response => response.blob())
        .then(actions.onDataReceived)
        .catch(actions.errored)

      return {
        error: false,
        isFetching: true,
        canFetch: false
      }
    },

    onDataReceived: blob => state => {
      if (state.imageSrc === '') {
        return { imageSrc: URL.createObjectURL(blob) }
      }
    },

    onHidden: () => ({
      error: false,
      imageSrc: '',
      isFetching: false,
      canFetch: true
    }),

    errored: () => ({ error: true, imageSrc: '' })
  },

  performance: {
    test: () => state => ({ numberOfElements: state.inputValue }),
    setInputValue: event => ({ inputValue: +event.target.value })
  }
}
