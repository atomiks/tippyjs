import {
  Tippy,
  TippyCallWrapper,
  PropHOF,
  EnhancedTippy,
  Targets,
  Props,
} from '..'

declare const enhance: (tippyBase: Tippy, propHOFs: PropHOF[]) => EnhancedTippy
declare const followCursor: (tippy: Tippy) => TippyCallWrapper
declare const inlinePositioning: (tippy: Tippy) => TippyCallWrapper

export default enhance
export { followCursor, inlinePositioning }
