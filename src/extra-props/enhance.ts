import { Tippy, EnhancedTippy, PropHOF } from '../types'

function copyStatics(to: EnhancedTippy, from: Tippy): EnhancedTippy {
  to.currentInput = from.currentInput
  to.version = from.version
  to.defaultProps = from.defaultProps
  to.setDefaultProps = from.setDefaultProps
  to.hideAll = from.hideAll

  return to
}

export default function enhance(
  tippyBase: Tippy,
  propHOFs: PropHOF[],
): EnhancedTippy {
  const tippyEnhanced = propHOFs.reduce(
    (nextTippy, addProp): EnhancedTippy => addProp(nextTippy),
    tippyBase,
  )

  return copyStatics(tippyEnhanced, tippyBase)
}
