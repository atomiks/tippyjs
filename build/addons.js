/* eslint-disable no-undef */
import delegate from '../src/addons/delegate.ts'
import singleton from '../src/addons/singleton.ts'

if (typeof tippy === 'function') {
  tippy.delegate = delegate
  tippy.singleton = singleton
} else {
  throw new Error(
    '[tippy.js ERROR] `tippy` is not a global function. Make sure you have ' +
      'included the tippy script before tippy-addons.',
  )
}

export { delegate, singleton }
