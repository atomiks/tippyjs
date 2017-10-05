let matches = {}

if (typeof Element !== 'undefined') {
  const e = Element.prototype
  matches =
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
}

export default matches