/**
 * Determines if a value is an object literal
 * @param {*} value
 * @return {Boolean}
 */
export default function isObjectLiteral(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}
