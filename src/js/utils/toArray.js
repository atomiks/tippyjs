/**
 * Ponyfill for Array.from
 * @param {*} value
 * @return {Array}
 */
export default function toArray(value) {
  return [].slice.call(value)
}
