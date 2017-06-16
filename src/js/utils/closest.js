/**
* Ponyfill to get the closest parent element
* @param {Element} element - child of parent to be returned
* @param {String} parentSelector - selector to match the parent if found
* @return {Element}
*/
export default function closest(element, parentSelector) {
    const matches = Element.prototype.matches               ||
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

    const _closest = Element.prototype.closest || function(selector) {
        let el = this
        while (el) {
            if (matches.call(el, selector)) {
                return el
            }
            el = el.parentElement
        }
    }

    return _closest.call(element, parentSelector)
}
