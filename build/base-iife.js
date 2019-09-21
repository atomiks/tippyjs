import tippy, { hideAll } from '../src'
import createSingleton from '../src/addons/createSingleton'
import delegate from '../src/addons/delegate'
import followCursor from '../src/plugins/followCursor'

tippy.use(followCursor)

tippy.createSingleton = createSingleton
tippy.delegate = delegate
tippy.hideAll = hideAll

export default tippy
