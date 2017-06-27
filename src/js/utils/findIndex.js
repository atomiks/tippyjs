import find from './find'

/**
* Ponyfill for Array.prototype.findIndex
* @param {Array} arr
* @param {Function} checkFn
* @return index of the item in the array
*/
export default function findIndex(arr, checkFn) {
  if (Array.prototype.findIndex) {
    return arr.findIndex(checkFn)
  }

  // fallback
  return arr.indexOf(find(arr, checkFn))
}
