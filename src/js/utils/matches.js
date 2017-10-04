const e = Element.prototype
export const matches =
  e.matches               ||
  e.matchesSelector       ||
  e.webkitMatchesSelector ||
  e.mozMatchesSelector    ||
  e.msMatchesSelector     ||
  function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
  }
