import css from '../dist/tippy.css'
import tippy from '../src'
import { injectCSS } from '../src/css'
import { isBrowser } from '../src/browser'
import createSingleton from '../src/addons/createSingleton'
import delegate from '../src/addons/delegate'
import enhance from '../src/extra-props/enhance'
import followCursor from '../src/extra-props/followCursor'

if (isBrowser) {
  injectCSS(css)
}

const tippyEnhanced = enhance(tippy, [followCursor])

tippyEnhanced.createSingleton = createSingleton
tippyEnhanced.delegate = delegate
tippyEnhanced.enhance = enhance
tippyEnhanced.followCursor = followCursor

export default tippyEnhanced
