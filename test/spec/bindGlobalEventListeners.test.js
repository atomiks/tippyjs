import { h, hasTippy, cleanDocumentBody, withTestOptions } from '../utils'

import tippy from '../../src/js/index'
import Defaults from '../../src/js/defaults'
import Selectors from '../../src/js/selectors'
import createTippy from '../../src/js/createTippy'
import bindEventListeners, * as Listeners from '../../src/js/bindGlobalEventListeners'

afterEach(cleanDocumentBody)

describe('onDocumentTouch', () => {
  it('sets isUsingTouch to `true`', () => {
    Listeners.onDocumentTouch()
    expect(Listeners.isUsingTouch).toBe(true)
  })
})

describe('onDocumentClick', () => {
  it('hides all poppers if neither a popper or reference was clicked', done => {
    const instance = tippy.one(h())
    expect(instance.state.isVisible).toBe(false)
    instance.show()
    Listeners.onDocumentClick({ target: document.createElement('div') })
    setTimeout(() => {
      expect(instance.state.isVisible).toBe(false)
      done()
    })
  })

  it('does not hide poppers if an interactive popper was clicked', done => {
    const instance = tippy.one(h(), {
      interactive: true,
    })
    expect(instance.state.isVisible).toBe(false)
    instance.show()
    Listeners.onDocumentClick({ target: instance.popper })
    setTimeout(() => {
      expect(instance.state.isVisible).toBe(true)
      done()
    })
  })

  it('hides poppers if a non-interactive popper was clicked', done => {
    const instance = tippy.one(h(), {
      interactive: false,
    })
    expect(instance.state.isVisible).toBe(false)
    instance.show()
    Listeners.onDocumentClick({ target: instance.popper })
    setTimeout(() => {
      expect(instance.state.isVisible).toBe(false)
      done()
    })
  })

  it('does not hide poppers if `hideOnClick: false` & clicked trigger-clicked reference', done => {
    const instance = tippy.one(h(), {
      trigger: 'click',
      hideOnClick: false,
    })
    instance.show()
    Listeners.onDocumentClick({ target: instance.reference })
    setTimeout(() => {
      expect(instance.state.isVisible).toBe(true)
      done()
    })
  })
})

describe('onWindowBlur', () => {
  it('blurs reference elements', () => {
    const ref = document.createElement('button')
    const instance = tippy.one(ref, { content: 'content' })
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

describe('onWindowResize', () => {
  it('updates poppers with `livePlacement: false`', () => {
    const instance = tippy.one(h(), withTestOptions({ livePlacement: false }))
    instance.show()
    const { scheduleUpdate } = instance.popperInstance
    instance.popperInstance.scheduleUpdate = jest.fn()
    Listeners.onWindowResize()
    expect(instance.popperInstance.scheduleUpdate.mock.calls.length).toBe(1)
  })
})

describe('bindEventListeners', () => {
  it('onDocumentTouch falls back to `pointerdown`', () => {
    Listeners.supportsTouch = false
    navigator.maxTouchPoints = 1
    bindEventListeners()
  })
})
