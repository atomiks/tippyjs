/**
* Ponyfill for Array.prototype.find
* @param {Array} arr
* @param {Function} checkFn
* @return item in the array
*/
export default function find(arr, checkFn) {
  return Array.prototype.find
    ? arr.find(checkFn)
    : arr.filter(checkFn)[0]
}
