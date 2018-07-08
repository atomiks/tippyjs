class ajax {
  onShow = () => (state, actions) => {
    if (state.isFetching || !state.canFetch) return

    fetch('https://unsplash.it/200/?random')
      .then(response => response.blob())
      .then(blob => {
        actions.setImageSrc(URL.createObjectURL(blob))
      })
      .catch(actions.errored)

    return {
      error: false,
      isFetching: true,
      canFetch: false
    }
  }

  onHidden = () => ({
    error: false,
    imageSrc: '',
    isFetching: false,
    canFetch: true
  })

  errored = () => ({ error: true, imageSrc: '' })

  setImageSrc = imageSrc => ({ imageSrc })
}

class performance {
  test = () => state => ({ numberOfElements: state.inputValue })

  setInputValue = event => ({ inputValue: +event.target.value })
}

class Actions {
  ajax = new ajax()
  performance = new performance()
}

export default new Actions()
