import { cleanDocumentBody } from '../utils'

import tippy from '../../src/index'
import * as Listeners from '../../src/bindGlobalEventListeners'

afterEach(cleanDocumentBody)

describe('onDocumentTouch', () => {
  it('sets isUsingTouch to `true`', () => {
    Listeners.onDocumentTouch()
    expect(Listeners.isUsingTouch).toBe(true)
  })
})

describe('onWindowBlur', () => {
  it('blurs reference elements', () => {
    const ref = document.createElement('button')
    tippy(ref, { content: 'content' })
    document.body.append(ref)
    let called = false
    ref.addEventListener('blur', () => {
      called = true
    })
    ref.focus()
    Listeners.onWindowBlur()
    expect(called).toBe(true)
  })
})
