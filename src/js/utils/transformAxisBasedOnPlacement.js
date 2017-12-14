/**
 * Transforms the `arrowTransform` x or y axis based on the placement axis
 * @param {String} axis 'X', 'Y', ''
 * @param {Boolean} isVertical
 * @return {String}
 */
export default function transformAxis(axis, isVertical) {
  if (!axis) return ''
  const map = {
    X: 'Y',
    Y: 'X'
  }
  return isVertical ? axis : map[axis]
}
