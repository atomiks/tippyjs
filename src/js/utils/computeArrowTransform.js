import prefix from '../utils/prefix'
import transformNumbersBasedOnPlacement from '../utils/transformNumbersBasedOnPlacement'
import transformAxisBasedOnPlacement from '../utils/transformAxisBasedOnPlacement'
import getPopperPlacement from '../utils/getPopperPlacement'

/**
 * Computes and applies the necessary arrow transform
 * @param {Element} popper
 * @param {Element} arrow
 * @param {String} arrowTransform
 */
export default function computeArrowTransform(popper, arrow, arrowTransform) {
  const placement = getPopperPlacement(popper)
  const isVertical = placement === 'top' || placement === 'bottom'
  const isReverse = placement === 'right' || placement === 'bottom'

  const getAxis = re => {
    const match = arrowTransform.match(re)
    return match ? match[1] : ''
  }

  const getNumbers = re => {
    const match = arrowTransform.match(re)
    return match ? match[1].split(',').map(parseFloat) : []
  }

  const re = {
    translate: /translateX?Y?\(([^)]+)\)/,
    scale: /scaleX?Y?\(([^)]+)\)/
  }

  const matches = {
    translate: {
      axis: getAxis(/translate([XY])/),
      numbers: getNumbers(re.translate)
    },
    scale: {
      axis: getAxis(/scale([XY])/),
      numbers: getNumbers(re.scale)
    }
  }

  const computedTransform = arrowTransform
    .replace(
      re.translate,
      `translate${transformAxisBasedOnPlacement(
        matches.translate.axis,
        isVertical
      )}(${transformNumbersBasedOnPlacement(
        'translate',
        matches.translate.numbers,
        isVertical,
        isReverse
      )})`
    )
    .replace(
      re.scale,
      `scale${transformAxisBasedOnPlacement(
        matches.scale.axis,
        isVertical
      )}(${transformNumbersBasedOnPlacement(
        'scale',
        matches.scale.numbers,
        isVertical,
        isReverse
      )})`
    )

  arrow.style[prefix('transform')] = computedTransform
}
