/* eslint-disable no-undef */
import delegate from '../src/addons/delegate.ts'
import createSingleton from '../src/addons/createSingleton.ts'

if (typeof tippy === 'function') {
  tippy.delegate = delegate
  tippy.createSingleton = createSingleton
} else {
  throw new Error(
    '`tippy` is not a global function. Make sure you have ' +
      'included the tippy script before tippy-addons.',
  )
}
