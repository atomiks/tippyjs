/**
 * Ponyfill for Array.prototype.find
 * @param {Array} arr
 * @param {Function} fn
 * @return item in the array
 */
export default function find(arr, fn) {
  return Array.prototype.find ? arr.find(fn) : arr.filter(fn)[0]
}
