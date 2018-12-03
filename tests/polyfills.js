global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return { right: 0 }
    },
    getClientRects: () => [],
    commonAncestorContainer: document.createElement('div')
  }
}

global.window.MutationObserver = require('mutation-observer')

global.window.focus = () => {}
global.window.scroll = () => {}
