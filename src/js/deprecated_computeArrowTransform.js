import Selectors from './selectors'
import { getPopperPlacement } from './popper'
import { closest } from './ponyfills'

// =============================================================================
// DEPRECATED
// All of this code (for the `arrowTransform` option) will be removed in v4
// =============================================================================
export const TRANSFORM_NUMBER_RE = {
  translate: /translateX?Y?\(([^)]+)\)/,
  scale: /scaleX?Y?\(([^)]+)\)/,
}

/**
 * Transforms the x/y axis based on the placement
 */
export function transformAxisBasedOnPlacement(axis, isVertical) {
  return (
    (isVertical
      ? axis
      : {
          X: 'Y',
          Y: 'X',
        }[axis]) || ''
  )
}

/**
 * Transforms the scale/translate numbers based on the placement
 */
export function transformNumbersBasedOnPlacement(
  type,
  numbers,
  isVertical,
  isReverse,
) {
  /**
   * Avoid destructuring because a large boilerplate function is generated
   * by Babel
   */
  const a = numbers[0]
  const b = numbers[1]

  if (!a && !b) {
    return ''
  }

  const transforms = {
    scale: (() => {
      if (!b) {
        return `${a}`
      } else {
        return isVertical ? `${a}, ${b}` : `${b}, ${a}`
      }
    })(),
    translate: (() => {
      if (!b) {
        return isReverse ? `${-a}px` : `${a}px`
      } else {
        if (isVertical) {
          return isReverse ? `${a}px, ${-b}px` : `${a}px, ${b}px`
        } else {
          return isReverse ? `${-b}px, ${a}px` : `${b}px, ${a}px`
        }
      }
    })(),
  }

  return transforms[type]
}

/**
 * Returns the axis for a CSS function (translate or scale)
 */
export function getTransformAxis(str, cssFunction) {
  const match = str.match(new RegExp(cssFunction + '([XY])'))
  return match ? match[1] : ''
}

/**
 * Returns the numbers given to the CSS function
 */
export function getTransformNumbers(str, regex) {
  const match = str.match(regex)
  return match ? match[1].split(',').map(n => parseFloat(n, 10)) : []
}

/**
 * Computes the arrow's transform so that it is correct for any placement
 */
function computeArrowTransform(arrow, arrowTransform) {
  const placement = getPopperPlacement(closest(arrow, Selectors.POPPER))
  const isVertical = placement === 'top' || placement === 'bottom'
  const isReverse = placement === 'right' || placement === 'bottom'

  const matches = {
    translate: {
      axis: getTransformAxis(arrowTransform, 'translate'),
      numbers: getTransformNumbers(
        arrowTransform,
        TRANSFORM_NUMBER_RE.translate,
      ),
    },
    scale: {
      axis: getTransformAxis(arrowTransform, 'scale'),
      numbers: getTransformNumbers(arrowTransform, TRANSFORM_NUMBER_RE.scale),
    },
  }

  const computedTransform = arrowTransform
    .replace(
      TRANSFORM_NUMBER_RE.translate,
      `translate${transformAxisBasedOnPlacement(
        matches.translate.axis,
        isVertical,
      )}(${transformNumbersBasedOnPlacement(
        'translate',
        matches.translate.numbers,
        isVertical,
        isReverse,
      )})`,
    )
    .replace(
      TRANSFORM_NUMBER_RE.scale,
      `scale${transformAxisBasedOnPlacement(
        matches.scale.axis,
        isVertical,
      )}(${transformNumbersBasedOnPlacement(
        'scale',
        matches.scale.numbers,
        isVertical,
        isReverse,
      )})`,
    )

  arrow.style[
    typeof document.body.style.transform !== 'undefined'
      ? 'transform'
      : 'webkitTransform'
  ] = computedTransform
}

export default computeArrowTransform
