/**
* Ponyfill for Array.prototype.find
* @param {Array} arr
* @param {Function} checkFn
* @return item in the array
*/
export default function find(arr, checkFn) {
  if (Array.prototype.find) {
    return arr.find(checkFn)
  }

  // use `filter` as fallback
  return arr.filter(checkFn)[0]
}
