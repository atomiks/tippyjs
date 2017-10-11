import { browser, defaults, selectors, store } from '../../src/js/core/globals'

import init from '../../src/js/core/init'

import defer                    from '../../src/js/utils/defer'
import noop                     from '../../src/js/utils/noop'
import getCorePlacement         from '../../src/js/utils/getCorePlacement'
import find                     from '../../src/js/utils/find'
import findIndex                from '../../src/js/utils/findIndex'
import prefix                   from '../../src/js/utils/prefix'
import closest                  from '../../src/js/utils/closest'
import isVisible                from '../../src/js/utils/isVisible'
import getOffsetDistanceInPx    from '../../src/js/utils/getOffsetDistanceInPx'
import applyTransitionDuration  from '../../src/js/utils/applyTransitionDuration'
import cursorIsOutsideInteractiveBorder from '../../src/js/utils/cursorIsOutsideInteractiveBorder'

import followCursorHandler              from '../../src/js/core/createTrigger'
import createTrigger                    from '../../src/js/core/createTrigger'
import onTransitionEnd                  from '../../src/js/core/onTransitionEnd'
import mountPopper                      from '../../src/js/core/mountPopper'
import makeSticky                       from '../../src/js/core/makeSticky'
import createPopperElement              from '../../src/js/core/createPopperElement'
import createPopperInstance             from '../../src/js/core/createPopperInstance'
import getArrayOfElements   from '../../src/js/core/getArrayOfElements'

import tippy from '../../src/js/tippy.js'

const createVirtualElement = () => {
  const el = document.createElement('div')
  el.className = 'test'
  el.setAttribute('title', 'tooltip')
  document.body.appendChild(el)
  return el
}

describe('core', () => {
  describe('init', () => {
    it('runs only once', () => {
      init()
      expect(init()).toBe(false)
    })

    window.TouchEvent && document.dispatchEvent(new TouchEvent('touchstart'))

    it('sets browser.usingTouch to be true upon touchstart, keeps it false if does not support touch', () => {
      window.TouchEvent && browser.supportsTouch
        ? expect(browser.usingTouch).toBe(true)
        : expect(browser.usingTouch).toBe(false)

      browser.usingTouch = false
    })

    it('adds .tippy-touch class to body if iOS, does not if not', () => {
      browser.iOS
        ? expect(document.body.classList).toContain('tippy-touch')
        : expect(document.body.classList).not.toContain('tippy-touch')
    })
  })

  describe('tippy', () => {
    describe('tippy.browser', () => {
      it('is the browser object', () => {
        expect(tippy.browser.supported).toBeDefined()
      })
    })

    describe('tippy.defaults', () => {
      it('is the default options object', () => {
        expect(tippy.defaults.html).toBeDefined()
      })
    })

    it('does not mutate the default options', () => {
      const optionsClone = { ...defaults }

      const el = createVirtualElement()

      const instance = tippy(el, {
        delay: 1000,
        duration: 0,
        popperOptions: {
          modifiers: {}
        }
      })

      expect(
        Object.keys(optionsClone).every(key => optionsClone[key] === defaults[key])
      ).toBe(true)

      expect(defaults.popperOptions.modifiers).toBeUndefined()

      instance.destroyAll()
    })

    it('works for a DOM element', () => {
      const el = createVirtualElement()

      const instance = tippy(el)
      expect(el.hasAttribute('x-tooltipped')).toBe(true)

      instance.destroyAll()
    })

    it('should not render if element has not been attached to DOM', () => {
      //Create DIV element which is not attached to DOM
      const el = document.createElement('div')
      el.className = 'test'
      el.setAttribute('title', 'tooltip')

      const storeLengthBefore = store.length
      const instance = tippy(el)
      instance.show(el._popper)

      const storeLengthAfter = store.length
      expect(storeLengthBefore).toBe(storeLengthAfter)
    })

    it('works for a CSS selector', () => {
      const el = createVirtualElement()

      document.body.appendChild(el)

      const instance = tippy('.test')
      expect(el.hasAttribute('x-tooltipped')).toBe(true)

      document.body.removeChild(el)

      instance.destroyAll()
    })

    it('will not affect elements with an empty title attribute and no html', () => {
      const el = createVirtualElement()
      el.setAttribute('title', '')

      const instance = tippy(el)

      expect(el.hasAttribute('x-tooltipped')).toBe(false)

      instance.destroyAll()
    })

    it('removes the title from the element', () => {
      const el = createVirtualElement()

      const instance = tippy(el)

      expect(!!el.getAttribute('title')).toBe(false)

      instance.destroyAll()
    })

    it('composes custom options with the default options', () => {
      const el = createVirtualElement()

      const instance = tippy(el, {
        placement: 'bottom',
        delay: [100, 200]
      })

      expect(
        instance.options.placement === 'bottom' &&
        instance.options.delay[0] === 100 &&
        instance.options.html === defaults.html
      ).toBe(true)

      instance.destroyAll()
    })

    /**
    * NOTE: getComputedStyle(tooltip).opacity === '1' in the `if` statement
    * of the `hidden` onTransitionEnd()
    * has caused this to fail but not for a reason I can see yet. Callbacks still
    * work appropriately.
    *
    describe('callbacks', () => {
      const el = createVirtualElement()

      let counter = 1
      let show, shown, hide, hidden
      let showThis, shownThis, hideThis, hiddenThis

      beforeEach(done => {
        let popper

        const instance = tippy(el, {
          duration: 0,
          onShow() {
            show = counter
            showThis = this === popper
            counter++
          },
          onShown() {
            shown = counter
            shownThis = this === popper
            counter++
            instance.hide(popper)
          },
          onHide() {
            hide = counter
            hideThis = this === popper
            counter++
          },
          onHidden() {
            hidden = counter
            hiddenThis = this === popper
            counter++
            instance.destroyAll()
            done()
          }
        })

        popper = instance.getPopperElement(el)
        instance.show(popper)
      })

      it('all 4 callbacks should be called in the correct order', () => {
        expect(show).toBe(1)
        expect(shown).toBe(2)
        expect(hide).toBe(3)
        expect(hidden).toBe(4)
      })

      it('`this` refers to the popper', () => {
        expect(showThis && shownThis && hideThis && hiddenThis).toBe(true)
      })
    })
    */
    describe('wait callback', () => {
      const el = createVirtualElement()

      let showIsAFunction, eventIsAnEventObject, popperStaysHidden

      beforeEach(done => {
        const instance = tippy(el, {
          wait(show, event) {
            showIsAFunction = typeof show === 'function'
            eventIsAnEventObject = event.type !== undefined
            done()
          }
        })

        const popper = el._popper

        el.dispatchEvent(new MouseEvent('mouseenter'))
        popperStaysHidden = popper.style.visibility !== 'visible'
      })

      it('should work', () => {
        expect(
          showIsAFunction && eventIsAnEventObject && popperStaysHidden
        ).toBe(true)
      })
    })

    describe('getData', () => {
      it('returns the reference object with either the ref el or popper as the argument', () => {
        const el = createVirtualElement()

        const instance = tippy(el)
        const ref = instance.getData(el)
        const ref2 = instance.getData(el._popper)

        ;[ref, ref2].forEach(ref => {
          expect(ref.toString()).toBe('[object Object]')
          expect(ref.popper).toBeDefined()
        })

        instance.destroyAll()
      })
    })

    describe('destroyAll', () => {
      it('should destroy all tooltips created by the instance, does NOT affect other instances', () => {
        const el = createVirtualElement()

        const lengthBefore = store.length
        const instance = tippy(el)
        instance.destroyAll()
        const lengthAfter = store.length

        expect(instance.state.destroyed).toBe(true)
        expect(lengthBefore).toBe(lengthAfter)
      })
    })

    describe('destroy', () => {
      it('restores the title on the element', () => {
        const el = createVirtualElement()

        const instance = tippy(el)
        const popper = el._popper

        instance.destroy(popper)

        expect(el.getAttribute('title')).toBe('tooltip')
      })

      it('removes listeners from the element, without affecting other listeners', () => {
        const el = createVirtualElement()

        let test = false
        el.addEventListener('mouseenter', () => {
          test = true
        })

        const instance = tippy(el)
        const popper = el._popper

        instance.destroy(popper)

        el.dispatchEvent(new MouseEvent('mouseenter'))

        expect(test).toBe(true)
        expect(document.querySelector(selectors.POPPER)).toBeNull()
      })

      it('removes the ref data object from store', () => {
        const el = createVirtualElement()

        const instance = tippy(el)
        const popper = el._popper

        expect(find(instance.store, ref => ref.popper === popper)).toBeDefined()
        expect(find(store, ref => ref.popper === popper)).toBeDefined()

        instance.destroy(popper)

        expect(find(instance.store, ref => ref.popper === popper)).toBeUndefined()
        expect(find(store, ref => ref.popper === popper)).toBeUndefined()
      })
    })

    describe('show', () => {
      it('shows a tooltip when manually invoked', () => {
        const el = createVirtualElement()

        const instance = tippy(el)
        const popper = el._popper

        instance.show(popper)

        expect(popper.style.visibility).toBe('visible')

        instance.destroyAll()
      })

      it('shows a tooltip when triggered by one of the events in the trigger string', () => {
        const el = createVirtualElement()
        const instance = tippy(el, {
          trigger: 'mouseenter click'
        })
        const popper = el._popper

        el.dispatchEvent(new MouseEvent('mouseenter'))
        expect(popper.style.visibility).toBe('visible')

        instance.hide(popper, 0)

        el.dispatchEvent(new MouseEvent('click'))
        expect(popper.style.visibility).toBe('visible')

        instance.destroyAll()
      })
    })

    describe('hide', () => {

      let counter = 0
      let mouseleaveWorked = false

      beforeEach(done => {
        if (!counter) return done()

        const el = createVirtualElement()

        const instance = tippy(el, {
          trigger: 'mouseenter',
          onHide() {
            mouseleaveWorked = true
            done()
          }
        })

        const popper = el._popper
        instance.show(popper, 0)

        el.dispatchEvent(new MouseEvent('mouseleave'))
      })

      it('hides a tooltip when manually invoked', () => {
        const el = createVirtualElement()

        const instance = tippy(el)
        const popper = el._popper

        instance.hide(popper)

        expect(popper.style.visibility).toBe('hidden')

        instance.destroyAll()

        counter++
      })

      it('hides a tooltip when mouseleave event is fired', () => {
        expect(mouseleaveWorked).toBe(true)
        counter++
      })

      it('applies the correct transition duration when duration is a number', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          duration: 200
        })
        const popper = el._popper
        const tooltip = popper.querySelector(selectors.TOOLTIP)

        instance.hide(popper)

        expect(tooltip.style[prefix('transitionDuration')]).toBe('200ms')

        instance.destroyAll()
      })

      it('applies the correct transition duration when duration is an array', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          duration: [500, 100]
        })
        const popper = el._popper
        const tooltip = popper.querySelector(selectors.TOOLTIP)

        instance.hide(popper)

        expect(tooltip.style[prefix('transitionDuration')]).toBe('100ms')

        instance.destroyAll()
      })

      it('applies the correct duration when passed manually', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          duration: 200
        })
        const popper = el._popper
        const tooltip = popper.querySelector(selectors.TOOLTIP)

        instance.hide(popper, 100)

        expect(tooltip.style[prefix('transitionDuration')]).toBe('100ms')

        instance.destroyAll()
      })
    })
  })

  describe('options', () => {
    describe('appendTo', () => {
      it('appends to document.body by default', () => {
        const el = createVirtualElement()
        const instance = tippy(el)
        const popper = el._popper
        instance.show(popper)
        expect(document.body.contains(popper)).toBe(true)
        instance.destroyAll()
      })

      it('appends to the specified element instead of document.body', () => {
        const el = createVirtualElement()
        const testContainer = document.createElement('div')
        testContainer.id = 'test-container'

        document.body.appendChild(testContainer)

        const instance = tippy(el, {
          appendTo: document.querySelector('#test-container')
        })

        const popper = el._popper
        instance.show(popper)

        expect(testContainer.contains(popper)).toBe(true)

        document.body.removeChild(testContainer)
        instance.destroyAll()
      })

      it('appends to the element evaluated from the tippy instance, instead of document.body', () => {
        const el = createVirtualElement()
        const testContainer = document.createElement('div')
        testContainer.id = 'test-container'

        document.body.appendChild(testContainer)

        const instance = tippy(el, {
          appendTo: () => document.querySelector('#test-container')
        })

        const popper = el._popper
        instance.show(popper)

        expect(testContainer.contains(popper)).toBe(true)

        document.body.removeChild(testContainer)
        instance.destroyAll()
      })

      it('appends to the element evaluated from changed tippy.defaults, instead of document.body', () => {
        const el = createVirtualElement()
        let testContainer = document.createElement('div')
        testContainer.id = 'test-container'
        document.body.appendChild(testContainer)

        tippy.defaults.appendTo = () => document.querySelector('#test-container')

        let instance = tippy(el)

        let popper = el._popper
        instance.show(popper)

        expect(testContainer.contains(popper)).toBe(true)

        // Simulate a DOM mutation that removes the previous appendTo element,
        // destroys poppers and reinitializes tippy with set defaults
        document.body.removeChild(testContainer)
        instance.destroyAll()

        testContainer = document.createElement('div')
        testContainer.id = 'test-container'
        document.body.appendChild(testContainer)

        // NOTE: Ideally, we should be able to move the
        // tippy initialization **before** creating a new #test-container,
        // to test that parent DOM is always evaluated when adding poppers.
        // But being able to evaluate to the new #test-container
        // during reinitialization is good enough.
        instance = tippy(el)

        // Should still append the popper to the newly created element
        // of the same selector (instead of the previously deleted one)
        popper = el._popper
        instance.show(popper)

        expect(testContainer.contains(popper)).toBe(true)

        // // Cleanup
        // document.body.removeChild(testContainer)
        // instance.destroyAll()
        // tippy.defaults.appendTo = null
      })
    })

    describe('animation', () => {
      it('sets the `x-animation` attribute on the tooltip', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          animation: 'fade'
        })

        const popper = el._popper
        expect(popper.querySelector(selectors.TOOLTIP).getAttribute('x-animation')).toBe('fade')
        instance.destroyAll()
      })
    })

    describe('arrow', () => {
      it('creates an x-arrow element as a child of the tooltip', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          arrow: true
        })

        const popper = el._popper
        expect(popper.querySelector(selectors.TOOLTIP).querySelector('[x-arrow]')).not.toBeNull()
        instance.destroyAll()
      })
    })

    describe('animateFill', () => {
      it('is disabled if `arrow` is true', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          arrow: true
        })

        const popper = el._popper
        expect(popper.querySelector(selectors.TOOLTIP).querySelector(selectors.circle)).toBeNull()
        instance.destroyAll()
      })
    })

    describe('delay', () => {
      it('delays a tooltip from showing', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          delay: 20
        })
        const popper = el._popper

        el.dispatchEvent(new Event('mouseenter'))

        expect(popper.style.visibility).toBe('')

        instance.destroyAll()
      })
    })

    describe('trigger', () => {
      it('works for each 3 main: mouseenter, focus, click', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          duration: 0,
          trigger: 'mouseenter focus click'
        })
        const popper = el._popper

        el.dispatchEvent(new Event('mouseenter'))
        expect(popper.style.visibility).toBe('visible')
        instance.hide(popper)

        el.dispatchEvent(new Event('focus'))
        expect(popper.style.visibility).toBe('visible')
        instance.hide(popper)

        el.dispatchEvent(new Event('click'))
        expect(popper.style.visibility).toBe('visible')
        instance.hide(popper)

        instance.destroyAll()
      })

      it('hides on opposite trigger', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          duration: 0,
          trigger: 'mouseenter click'
        })
        const popper = el._popper
        instance.show(popper)

        el.dispatchEvent(new Event('mouseleave'))
        expect(popper.style.visibility).toBe('hidden')
        instance.show(popper)

        el.dispatchEvent(new Event('click'))
        expect(popper.style.visibility).toBe('hidden')

        instance.destroyAll()
      })
    })

    describe('interactive', () => {
      let hideFired = false

      beforeEach(done => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          duration: 0,
          trigger: 'click',
          interactive: true,
          onShow() {
            setTimeout(() => {
              done()
              instance.destroyAll()
            }, 20)
          },
          onHide() {
            hideFired = true
          }
        })
        const popper = el._popper
        instance.show(popper)
        popper.dispatchEvent(new Event('click'))
      })

      it('prevents a tooltip from closing when clicked on', () => {
        expect(hideFired).toBe(false)
      })
    })

    describe('placement', () => {
      it('is sets the correct `placement` setting in Popper.js config', () => {
        const el = createVirtualElement()

        ;['top', 'bottom', 'left', 'right'].forEach(placement => {

          const instance = tippy(el, {
            placement
          })

          const popper = el._popper
          instance.show(popper, 0)

          expect(popper.getAttribute('x-placement')).toBe(placement)

          ;['-start', '-end'].forEach(shift => {

            const el = createVirtualElement()

            const instance = tippy(el, {
              placement: placement + shift
            })

            const popper = el._popper
            instance.show(popper, 0)
            expect(popper.getAttribute('x-placement')).toBe(placement + shift)
            instance.destroyAll()
          })

          instance.destroyAll()
        })
      })
    })

    describe('zIndex', () => {
      it('is applied to the tooltip popper element', () => {
        const el = createVirtualElement()

        const instance = tippy(el, {
          zIndex: 10
        })

        const popper = el._popper
        expect(popper.style.zIndex).toBe('10')

        instance.destroyAll()
      })
    })

    describe('dynamicTitle', () => {
      let instance, popper, currentContent

      beforeEach(done => {
        const el = createVirtualElement()

        instance = tippy(el, {
          dynamicTitle: true
        })

        popper = el._popper
        currentContent = popper.querySelector(selectors.CONTENT).innerHTML

        el.setAttribute('title', 'new')

        defer(done)
      })

      it('updates the tooltip content if the title attribute changed', () => {
        const newContent = popper.querySelector(selectors.CONTENT).innerHTML
        expect(currentContent).not.toBe(newContent)

        instance.destroyAll()
      })
    })
  })

  describe('createPopperInstance', () => {

    it('returns a new Popper instance', () => {
      const el = createVirtualElement()

      const instance = tippy(el)
      const ref = instance.getData(el)

      const popperInstance = createPopperInstance(ref)

      expect(typeof popperInstance.update).toBe('function')

      instance.destroyAll()
    })
  })

  describe('getArrayOfElements', () => {
    it('returns an array of Elements', () => {
      const el1 = createVirtualElement()
      const el2 = createVirtualElement()
      const el3 = createVirtualElement()
      const el4 = createVirtualElement()

      document.body.appendChild(el2)

      const res1 = getArrayOfElements(el1)
      const res2 = getArrayOfElements('.test')
      const res3 = getArrayOfElements([el3, el4])

      ;[res1, res2, res3].forEach(res =>
        expect(res.every(item => item instanceof Element)).toBe(true)
      )

      document.body.removeChild(el2)
    })
  })

  describe('createTrigger', () => {
    const el = createVirtualElement()
    const handlers = {
      handleTrigger: function() {},
      handleMouseleave: function() {},
      handleBlur: function() {}
    }

    it('returns listeners array containing opposite event', () => {
      const listeners1 = createTrigger('mouseenter', el, handlers, false)
      const listeners2 = createTrigger('focus', el, handlers, false)

      expect(
        find(listeners1, o => o.event === 'mouseleave')
      ).toBeDefined()

      expect(
        find(listeners2, o => o.event === 'blur')
      ).toBeDefined()
    })

    it('creates `touchstart` and `touchend` events if `touchHold` setting is true', () => {

      const listeners = createTrigger('mouseenter', el, handlers, true)

      if (browser.supportsTouch) {
        ['touchstart', 'touchend'].forEach(e =>
          expect(find(listeners, o => o.event === e)).toBeDefined()
        )
      } else {
        ['touchstart', 'touchend'].forEach(e =>
          expect(find(listeners, o => o.event === e)).toBeUndefined()
        )
      }
    })
  })

  describe('cursorIsOutsideInteractiveBorder', () => {

    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.left = '100px'
    wrapper.style.top = '100px'

    const popper = document.createElement('div')
    popper.setAttribute('x-placement', 'top')
    popper.innerHTML = 'text'

    wrapper.appendChild(popper)

    document.body.appendChild(wrapper)

    const options = {
      interactiveBorder: 10,
      distance: 10
    }

    it('should be false if cursor is within border', () => {
      // Inside element
      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 105,
            clientY: 105
          },
          popper,
          options
        )
      ).toBe(false)

      // Outside element: TOP/LEFT
      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 92,
            clientY: 94
          },
          popper,
          options
        )
      ).toBe(false)

      // Outside element: TOP/RIGHT
      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 125,
            clientY: 92
          },
          popper,
          options
        )
      ).toBe(false)

      // Outside element: BOTTOM/LEFT
      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 92,
            clientY: 110
          },
          popper,
          options
        )
      ).toBe(false)

      // Outside element: BOTTOM/RIGHT
      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 125,
            clientY: 115
          },
          popper,
          options
        )
      ).toBe(false)
    })

    it('should be true if cursor is outside border', () => {
      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 150,
            clientY: 88
          },
          popper,
          options
        )
      ).toBe(true)

      expect(
        cursorIsOutsideInteractiveBorder(
          {
            clientX: 105,
            clientY: 140
          },
          popper,
          options
        )
      ).toBe(true)

      document.body.removeChild(wrapper)
    })
  })

  describe('getIndividualOptions', () => {
    it('uses data-tippy-* attributes to override instance options', () => {
      const el = createVirtualElement()
      el.setAttribute('data-tippy-duration', '1000')

      const instance = tippy(el)
      const ref = instance.getData(el)

      expect(ref.options.duration).not.toBe(instance.options.duration)
    })

    it('does not override instance options if `performance` is true', () => {
      const el = createVirtualElement()
      el.setAttribute('data-tippy-duration', '1000')

      const instance = tippy(el, { performance: true })
      const ref = instance.getData(el)

      expect(ref.options.duration).toBe(instance.options.duration)
    })
  })

  describe('onTransitionEnd', () => {

    let a = false,
    b = false,
    c = false

    const DURATION = 20

    const el = createVirtualElement()
    el.style[prefix('transitionDuration')] = DURATION

    const instance = tippy(el, {
      duration: DURATION
    })
    const ref = instance.getData(el)

    let firstItDone = false

    beforeEach(done => {
      if (!firstItDone) {
        setTimeout(() => {
          b = true
          firstItDone = true
          done()
        }, DURATION - 1)
      } else {
        setTimeout(done, DURATION + 1)
      }

      onTransitionEnd(ref, DURATION, () => {
        a = true
        if (firstItDone) {
          c = true
        }
      })
    })

    it('waits for transitions to complete', () => {
      expect(a).not.toBe(b)
    })

    it('runs the callback once transitions are complete', () => {
      expect(c).toBe(true)
    })

    it('is synchronous if duration is 0', () => {
      let test = false
      onTransitionEnd(ref, 0, () => {
        test = true
      })
      expect(test).toBe(true)
    })
  })

  describe('mountPopper', () => {
    it('appends the popper to the DOM', () => {
      const el = createVirtualElement()

      const instance = tippy(el)
      const ref = instance.getData(el)

      mountPopper(ref)

      expect(document.querySelector(selectors.POPPER)).not.toBeNull()

      const popper = el._popper
      popper.style.visibility = 'visible'
      instance.destroyAll()
    })

    it('creates a single popper instance on first mount', () => {
      const el = createVirtualElement()

      const instance = tippy(el)
      const ref = instance.getData(el)

      mountPopper(ref)

      const cache = ref.popperInstance

      mountPopper(ref)

      expect(ref.popperInstance).toBeDefined()
      expect(ref.popperInstance).toBe(cache)

      ref.popper.style.visibility = 'visible'
      instance.destroyAll()
    })

    it('enables event listeners if `followCursor` is false or browser.usingTouch is true', () => {
      const el = createVirtualElement()

      let instance = tippy(el)
      let ref = instance.getData(el)

      mountPopper(ref)

      expect(ref.popperInstance.state.eventsEnabled).toBe(true)

      ref.popper.style.visibility = 'visible'
      instance.destroyAll()

      browser.usingTouch = true

      instance = tippy(el, {
        followCursor: true
      })
      ref = instance.getData(el)

      mountPopper(ref)

      expect(ref.popperInstance.state.eventsEnabled).toBe(true)

      ref.popper.style.visibility = 'visible'
      instance.destroyAll()
      browser.usingTouch = false
    })

    it('disables event listeners if `followCursor` is true', () => {
      const el = createVirtualElement()

      const instance = tippy(el, {
        followCursor: true
      })
      const ref = instance.getData(el)

      mountPopper(ref)

      expect(ref.popperInstance.state.eventsEnabled).toBe(false)

      ref.popper.style.visibility = 'visible'
      instance.destroyAll()
    })
  })
})

describe('utils', () => {

  describe('getCorePlacement', () => {
    it('returns the non-shifted placement for all combinations', () => {
      ['top', 'bottom', 'left', 'right'].forEach(placement => {

        expect(
          getCorePlacement(placement)
        ).toBe(placement)

        ;['-start', '-end'].forEach(shift => {
          expect(
            getCorePlacement(placement + shift)
          ).toBe(placement)
        })

      })
    })

  })

  describe('find', () => {
    it('behaves like Array.prototype.find', () => {
      const arr = [
        { name: 'Bob', city: 'Los Angeles' },
        { name: 'Jim', city: 'Sydney' },
        { name: 'Bob', city: 'London' }
      ]

      expect(
        find(arr, o => o.name === 'Bob').city
      ).toBe('Los Angeles')

      expect(
        find(arr, o => o.city === 'London')
      ).toBe(arr[2])
    })
  })

  describe('findIndex', () => {
    it('behaves like Array.prototype.findIndex', () => {
      const arr = [
        { name: 'Bob', city: 'Los Angeles' },
        { name: 'Jim', city: 'Sydney' },
        { name: 'Bob', city: 'London' }
      ]

      expect(
        findIndex(arr, o => o.name === 'Bob')
      ).toBe(0)

      expect(
        findIndex(arr, o => o.city === 'London')
      ).toBe(2)
    })
  })

  describe('prefix', () => {
    it('prefixes a given property', () => {
      const prefixedProp = prefix('transition')
      expect(prefixedProp === 'transition' || prefixedProp === 'webkitTransition').toBe(true)
    })
  })

  describe('closest', () => {
    it('finds and returns the closest parent element', () => {
      const parent = document.createElement('div')
      parent.className = 'parent'

      const child = document.createElement('div')
      const grandchild = document.createElement('p')

      parent.appendChild(child)
      child.appendChild(grandchild)

      expect(closest(grandchild, '.parent') === parent).toBe(true)
    })
  })

  describe('isVisible', () => {
    it('determines if an element has a visible style', () => {
      const popper = document.createElement('div')
      popper.style.visibility = 'visible'

      expect(isVisible(popper)).toBe(true)

      popper.style.visibility = 'hidden'

      expect(isVisible(popper)).toBe(false)
    })
  })

  describe('applyTransitionDuration', () => {
    it('applies a transition duration to a list of elements', () => {
      const el1 = createVirtualElement()
      const el2 = createVirtualElement()

      applyTransitionDuration([el1, el2], 100)

      expect(el1.style[prefix('transitionDuration')]).toBe('100ms')
      expect(el2.style[prefix('transitionDuration')]).toBe('100ms')
    })
  })

  describe('noop', () => {
    it('is callable and does nothing', () => {
      expect(noop()).toBeUndefined()
    })
  })

  describe('getOffsetDistanceInPx', () => {
    it('returns the correct offset distance in px', () => {
      expect(getOffsetDistanceInPx(10)).toBe('0px')
      expect(getOffsetDistanceInPx(15)).toBe('-5px')
      expect(getOffsetDistanceInPx(5)).toBe('5px')
      expect(getOffsetDistanceInPx(-1)).toBe('11px')
    })
  })
})
