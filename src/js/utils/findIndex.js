import find from './find'

/**
 * Ponyfill for Array.prototype.findIndex
 * @param {Array} arr
 * @param {Function} fn
 * @return index of the item in the array
 */
export default function findIndex(arr, fn) {
  return Array.prototype.findIndex ? arr.findIndex(fn) : arr.indexOf(find(arr, fn))
}
