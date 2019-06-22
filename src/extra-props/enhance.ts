import { Tippy } from '../types'

export default function enhance(tippyBase: Tippy, propHOFs: Function[]) {
  return propHOFs.reduce((nextTippy, addProp) => addProp(nextTippy), tippyBase)
}
