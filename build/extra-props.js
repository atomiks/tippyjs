/* eslint-disable no-undef */
import enhance from '../src/extra-props/enhance.ts'
import followCursor from '../src/extra-props/followCursor.ts'
import inlinePositioning from '../src/extra-props/inlinePositioning'

if (typeof tippy === 'function') {
  window.tippy = enhance(tippy, [followCursor, inlinePositioning])
} else {
  throw new Error(
    '[tippy.js ERROR] `tippy` is not a global function. Make sure you have ' +
      'included the tippy script before tippy-extra-props.',
  )
}
