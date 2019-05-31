import { cleanDocumentBody } from '../utils'

import tippy from '../../src'
import * as Listeners from '../../src/bindGlobalEventListeners'
import { IOS_CLASS } from '../../src/constants'

afterEach(cleanDocumentBody)

describe('onDocumentTouchStart', () => {
  it('sets input.touch to `true` and adds tippy-iOS class to body', () => {
    const bodyClass = document.body.classList
    expect(bodyClass.contains(IOS_CLASS)).toBe(false)
    Listeners.onDocumentTouchStart()
    Listeners.onDocumentTouchStart()
    expect(Listeners.currentInput.isTouch).toBe(true)
    expect(bodyClass.contains(IOS_CLASS)).toBe(true)
  })

  it('is undone if two consecutive mousemove events are fired', () => {
    // NOTE: this is dependent on the previous test
    Listeners.onDocumentMouseMove()
    Listeners.onDocumentMouseMove()
    expect(Listeners.currentInput.isTouch).toBe(false)
    expect(document.body.classList.contains(IOS_CLASS)).toBe(true)
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
