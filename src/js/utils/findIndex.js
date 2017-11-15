import find from './find'

/**
* Ponyfill for Array.prototype.findIndex
* @param {Array} arr
* @param {Function} checkFn
* @return index of the item in the array
*/
export default function findIndex(arr, checkFn) {
  return Array.prototype.findIndex
    ? arr.findIndex(checkFn)
    : arr.indexOf(find(arr, checkFn))
}
