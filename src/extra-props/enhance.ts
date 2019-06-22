import { Tippy, Props } from '../types'

interface EnhancedTippy extends Tippy {
  version: string
  defaultProps: Props
}

type PropHOF = (tippy: Tippy) => EnhancedTippy

function copyStatics(to: EnhancedTippy, from: Tippy): EnhancedTippy {
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
