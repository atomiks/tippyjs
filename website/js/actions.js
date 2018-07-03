class ajax {
  onShow = () => (state, actions) => {
    if (state.isLoading) return

    fetch('https://unsplash.it/200/?random')
      .then(resp => resp.blob())
      .then(blob => {
        actions.setImageSrc(URL.createObjectURL(blob))
      })
      .catch(actions.errored)

    return { error: false, isLoading: true }
  }
  onHidden = () => ({ error: false, imageSrc: '', isLoading: false })
  errored = () => ({ error: true })
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
