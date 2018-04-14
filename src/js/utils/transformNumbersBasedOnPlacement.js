/**
 * Transforms the `arrowTransform` numbers based on the placement axis
 * @param {String} type 'scale' or 'translate'
 * @param {Number[]} numbers
 * @param {Boolean} isVertical
 * @param {Boolean} isReverse
 * @return {String}
 */
export default function transformNumbersBasedOnPlacementAxis(
  type,
  numbers,
  isVertical,
  isReverse
) {
  if (!numbers.length) return ''

  const transforms = {
    scale: (() => {
      if (numbers.length === 1) {
        return `${numbers[0]}`
      } else {
        return isVertical
          ? `${numbers[0]}, ${numbers[1]}`
          : `${numbers[1]}, ${numbers[0]}`
      }
    })(),
    translate: (() => {
      if (numbers.length === 1) {
        return isReverse ? `${-numbers[0]}px` : `${numbers[0]}px`
      } else {
        if (isVertical) {
          return isReverse
            ? `${numbers[0]}px, ${-numbers[1]}px`
            : `${numbers[0]}px, ${numbers[1]}px`
        } else {
          return isReverse
            ? `${-numbers[1]}px, ${numbers[0]}px`
            : `${numbers[1]}px, ${numbers[0]}px`
        }
      }
    })()
  }

  return transforms[type]
}
