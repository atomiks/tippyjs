/**
 * Returns duration taking into account the option being either a number or array
 * @param {Number} duration
 * @param {Number} index
 * @return {Number}
 */
export default function getDuration(duration, index) {
  return Array.isArray(duration) ? duration[index] : duration
}
