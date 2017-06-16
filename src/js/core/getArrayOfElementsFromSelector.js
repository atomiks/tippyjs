/**
* Returns an array of elements based on the selector input
* @param {String|Element} selector
* @return {Array} of HTML Elements
*/
export default function getArrayOfElementsFromSelector(selector) {
    if (selector instanceof Element) {
        return [selector]
    }

    return [].slice.call(document.querySelectorAll(selector))
}
