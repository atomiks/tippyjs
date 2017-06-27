export const matches =
  Element.prototype.matches               ||
  Element.prototype.matchesSelector       ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.mozMatchesSelector    ||
  Element.prototype.msMatchesSelector     ||
  function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
  }
