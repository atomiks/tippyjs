import tippy, { setDefaultProps, hideAll } from '../src'
import createSingleton from '../src/addons/createSingleton'
import delegate from '../src/addons/delegate'
import enhance from '../src/extra-props/enhance'
import followCursor from '../src/extra-props/followCursor'

const tippyEnhanced = enhance(tippy, [followCursor])

tippyEnhanced.createSingleton = createSingleton
tippyEnhanced.delegate = delegate
tippyEnhanced.enhance = enhance
tippyEnhanced.followCursor = followCursor
tippyEnhanced.hideAll = hideAll
tippyEnhanced.setDefaultProps = setDefaultProps

export default tippyEnhanced
