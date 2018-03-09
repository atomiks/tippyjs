/**
 * Returns the value taking into account the value being either a number or array
 * @param {Number|Array} value
 * @param {Number} index
 * @return {Number}
 */
export default function getValue(value, index) {
  return Array.isArray(value) ? value[index] : value
}
