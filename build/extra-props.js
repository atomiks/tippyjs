/* eslint-disable no-undef */
import enhance from '../src/extra-props/enhance.ts'
import followCursor from '../src/extra-props/followCursor.ts'

window.tippy = enhance(tippy, [followCursor])
