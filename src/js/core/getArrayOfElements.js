/**
* Returns an array of elements based on the selector input
* @param {String|Element} selector
* @return {Elements[]}
*/
export default function getArrayOfElements(selector) {
    if (selector instanceof Element) {
        return [selector]
    }

    return [].slice.call(document.querySelectorAll(selector))
}
