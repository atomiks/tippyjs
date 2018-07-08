class ajax {
  imageSrc = ''
  isLoading = false
  error = false
  canFetch = true
}

class performance {
  inputValue = 0
  numberOfElements = 0
}

class State {
  ajax = new ajax()
  performance = new performance()
}

export default new State()
