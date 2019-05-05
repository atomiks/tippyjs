import { cleanDocumentBody } from '../utils'

import tippy from '../../src'
import * as Listeners from '../../src/bindGlobalEventListeners'
import { IOS_CLASS } from '../../src/constants'

afterEach(cleanDocumentBody)

describe('onDocumentTouch', () => {
  it('sets isUsingTouch to `true` and adds tippy-iOS class to body', () => {
    const bodyClass = document.body.classList
    expect(bodyClass.contains(IOS_CLASS)).toBe(false)
    Listeners.onDocumentTouch()
    Listeners.onDocumentTouch()
    expect(Listeners.isUsingTouch).toBe(true)
    expect(bodyClass.contains(IOS_CLASS)).toBe(true)
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
