import css from '../dist/tippy.css'
import tippy, { hideAll } from '../src'
import { injectCSS } from '../src/css'
import { isBrowser } from '../src/browser'
import createSingleton from '../src/addons/createSingleton'
import delegate from '../src/addons/delegate'
import followCursor from '../src/plugins/followCursor'
import sticky from '../src/plugins/sticky'

if (isBrowser) {
  injectCSS(css)
}

tippy.use(followCursor)
tippy.use(sticky)

tippy.createSingleton = createSingleton
tippy.delegate = delegate
tippy.hideAll = hideAll

export default tippy
