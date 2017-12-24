import { isBrowser } from '../core/globals'

let matches = {}

if (isBrowser) {
  const e = Element.prototype
  matches =
    e.matches ||
    e.matchesSelector ||
    e.webkitMatchesSelector ||
    e.mozMatchesSelector ||
    e.msMatchesSelector ||
    function(s) {
      const matches = (this.document || this.ownerDocument).querySelectorAll(s)
      let i = matches.length
      while (--i >= 0 && matches.item(i) !== this) {} // eslint-disable-line no-empty
      return i > -1
    }
}

export default matches
