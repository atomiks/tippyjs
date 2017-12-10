import { browser, defaults, selectors } from '../../src/js/core/globals'

import { _createPopperInstance, _onTransitionEnd } from '../../src/js/core/Tippy'

import bindEventListeners from '../../src/js/core/bindEventListeners'
import defer from '../../src/js/utils/defer'
import getPopperPlacement from '../../src/js/utils/getPopperPlacement'
import find from '../../src/js/utils/find'
import findIndex from '../../src/js/utils/findIndex'
import prefix from '../../src/js/utils/prefix'
import closest from '../../src/js/utils/closest'
import getOffsetDistanceInPx from '../../src/js/utils/getOffsetDistanceInPx'
import applyTransitionDuration from '../../src/js/utils/applyTransitionDuration'
import isObjectLiteral from '../../src/js/utils/isObjectLiteral'
import cursorIsOutsideInteractiveBorder from '../../src/js/utils/cursorIsOutsideInteractiveBorder'
import transformNumbersBasedOnPlacement from '../../src/js/utils/transformNumbersBasedOnPlacement'
import transformAxisBasedOnPlacement from '../../src/js/utils/transformAxisBasedOnPlacement'
import getArrayOfElements from '../../src/js/utils/getArrayOfElements'
import createTrigger from '../../src/js/utils/createTrigger'
import createPopperElement from '../../src/js/utils/createPopperElement'

import tippy from '../../src/js/tippy.js'

const createVirtualElement = (append = true) => {
  const el = document.createElement('div')
  el.className = 'test'
  el.setAttribute('title', 'tooltip')
  if (append) {
    document.body.appendChild(el)
  }
  return el
}

describe('core', () => {
  describe('binsdEventListeners', () => {
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

      const tip = tippy(el, {
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

      tip.destroyAll()
    })

    it('works for a DOM element', () => {
      const el = createVirtualElement()

      const tip = tippy(el)
      expect(el.hasAttribute('data-tippy')).toBe(true)

      tip.destroyAll()
    })

    it('should be destroyed if the reference element is not on the DOM', () => {
      const el = createVirtualElement(false)

      tippy(el)
      const instance = el._tippy
      el._tippy.show()
      
      expect(el._tippy).toBeUndefined()
      expect(instance.state.destroyed).toBe(true)
    })

    it('works for a CSS selector', () => {
      const el = createVirtualElement()

      document.body.appendChild(el)

      const tip = tippy('.test')
      expect(el.hasAttribute('data-tippy')).toBe(true)

      document.body.removeChild(el)

      tip.destroyAll()
    })

    it('will not affect elements with an empty title attribute and no html', () => {
      const el = createVirtualElement()
      el.setAttribute('title', '')

      const tip = tippy(el)

      expect(el.hasAttribute('data-tippy')).toBe(false)

      tip.destroyAll()
    })

    it('removes the title from the element', () => {
      const el = createVirtualElement()

      const tip = tippy(el)

      expect(!!el.getAttribute('title')).toBe(false)

      tip.destroyAll()
    })

    it('merges custom options with the default options', () => {
      const el = createVirtualElement()

      const tip = tippy(el, {
        placement: 'bottom',
        delay: [100, 200]
      })

      expect(
        tip.options.placement === 'bottom' &&
        tip.options.delay[0] === 100 &&
        tip.options.html === defaults.html
      ).toBe(true)

      tip.destroyAll()
    })

    describe('wait callback', () => {
      const el = createVirtualElement()

      let tip, showIsAFunction, eventIsAnEventObject, popperStaysHidden

      beforeEach(done => {
        tip = tippy(el, {
          wait(show, event) {
            showIsAFunction = typeof show === 'function'
            eventIsAnEventObject = event.type !== undefined
            done()
          }
        })

        el.dispatchEvent(new MouseEvent('mouseenter'))
        popperStaysHidden = el._tippy.popper.style.visibility !== 'visible'
      })

      it('should work', () => {
        expect(
          showIsAFunction && eventIsAnEventObject && popperStaysHidden
        ).toBe(true)
        tip.destroyAll()
      })
    })

    describe('destroyAll', () => {
      it('should destroy all tooltips created by the instance, does NOT affect other instances', () => {
        const els = {
          a: createVirtualElement(),
          b: createVirtualElement()
        }
        
        const instances = {
          a: tippy(els.a),
          b: tippy(els.b)
        }
        
        const tippys = {
          a: els.a._tippy,
          b: els.b._tippy
        }
        
        instances.a.destroyAll()

        expect(tippys.a.state.destroyed).toBe(true)
        expect(tippys.b.state.destroyed).toBe(false)
      })
    })

    describe('destroy', () => {
      it('restores the title on the element', () => {
        const el = createVirtualElement()

        tippy(el)
        el._tippy.destroy()

        expect(el.getAttribute('title')).toBe('tooltip')
      })

      it('removes listeners from the element, without affecting other listeners', () => {
        const el = createVirtualElement()

        let test = false
        el.addEventListener('mouseenter', () => {
          test = true
        })

        const tip = tippy(el)
        el._tippy.destroy()

        el.dispatchEvent(new MouseEvent('mouseenter'))

        expect(test).toBe(true)
        expect(document.querySelector(selectors.POPPER)).toBeNull()
        
        tip.destroyAll()
      })
    })

    describe('show', () => {
      it('shows a tooltip when manually invoked', () => {
        const el = createVirtualElement()

        const tip = tippy(el)
        el._tippy.show()

        expect(el._tippy.state.visible).toBe(true)

        tip.destroyAll()
      })

      it('shows a tooltip when triggered by one of the events in the trigger string', () => {
        const el = createVirtualElement()
        
        const tip = tippy(el, {
          trigger: 'mouseenter click'
        })

        el.dispatchEvent(new MouseEvent('mouseenter'))
        expect(el._tippy.popper.style.visibility).toBe('visible')

        el._tippy.hide(0)

        el.dispatchEvent(new MouseEvent('click'))
        expect(el._tippy.popper.style.visibility).toBe('visible')

        tip.destroyAll()
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

        el._tippy.show(0)

        el.dispatchEvent(new MouseEvent('mouseleave'))
      })

      it('hides a tooltip when manually invoked', () => {
        const el = createVirtualElement()

        const tip = tippy(el)
        const popper = el._tippy.popper

        el._tippy.hide()

        expect(el._tippy.state.visible).toBe(false)

        tip.destroyAll()

        counter++
      })

      it('hides a tooltip when mouseleave event is fired', () => {
        expect(mouseleaveWorked).toBe(true)
        counter++
      })

      it('applies the correct transition duration when duration is a number', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          duration: 200
        })
        const tooltip = el._tippy.popper.querySelector(selectors.TOOLTIP)

        el._tippy.hide()

        expect(tooltip.style[prefix('transitionDuration')]).toBe('200ms')
      })

      it('applies the correct transition duration when duration is an array', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          duration: [500, 100]
        })
        const tooltip = el._tippy.popper.querySelector(selectors.TOOLTIP)

        el._tippy.hide()

        expect(tooltip.style[prefix('transitionDuration')]).toBe('100ms')

        tip.destroyAll()
      })

      it('applies the correct duration when passed manually', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          duration: 200
        })
        const tooltip = el._tippy.popper.querySelector(selectors.TOOLTIP)

        el._tippy.hide(100)

        expect(tooltip.style[prefix('transitionDuration')]).toBe('100ms')

        tip.destroyAll()
      })
    })
    
    describe('_onTransitionEnd', () => {
      let a = false,
      b = false,
      c = false

      const DURATION = 20

      const el = createVirtualElement()
      el.style[prefix('transitionDuration')] = DURATION

      const tip = tippy(el, {
        duration: DURATION
      })

      let firstItDone = false

      beforeEach(done => {
        if (!firstItDone) {
          setTimeout(() => {
            b = true
            firstItDone = true
            done()
          }, DURATION - 1)
        } else {
          setTimeout(done, DURATION + 100)
        }
        
      _onTransitionEnd.call(el._tippy, DURATION, () => {
          a = true
          if (firstItDone) {
            c = true
          }
        })
      })

      it('waits for transitions to complete', () => {
        expect(a).not.toBe(b)
      })
    })
    
    describe('_createPopperInstance', () => {
      it('returns a new Popper instance', () => {
        const el = createVirtualElement()

        const tip = tippy(el)
        const pop = _createPopperInstance.call(el._tippy)

        expect(typeof pop.update).toBe('function')

        tip.destroyAll()
      })
    })
  })

  describe('options', () => {
    describe('appendTo', () => {
      it('appends to document.body by default', () => {
        const el = createVirtualElement()
        const tip = tippy(el)
        el._tippy.show(0)
        expect(document.body.contains(el._tippy.popper)).toBe(true)
        tip.destroyAll()
      })

      it('appends to the specified element instead of document.body', () => {
        const el = createVirtualElement()
        const testContainer = document.createElement('div')
        testContainer.id = 'test-container'

        document.body.appendChild(testContainer)

        const tip = tippy(el, {
          appendTo: document.querySelector('#test-container')
        })
        el._tippy.show()

        expect(testContainer.contains(el._tippy.popper)).toBe(true)

        document.body.removeChild(testContainer)
        tip.destroyAll()
      })

      it('appends to the element evaluated from the tippy instance, instead of document.body', () => {
        const el = createVirtualElement()
        const testContainer = document.createElement('div')
        testContainer.id = 'test-container'

        document.body.appendChild(testContainer)

        const tip = tippy(el, {
          appendTo: () => document.querySelector('#test-container')
        })

        el._tippy.show()
        
        expect(testContainer.contains(el._tippy.popper)).toBe(true)

        document.body.removeChild(testContainer)
        tip.destroyAll()
      })

      it('appends to the element evaluated from changed tippy.defaults, instead of document.body', () => {
        const el = createVirtualElement()
        let testContainer = document.createElement('div')
        testContainer.id = 'test-container'
        document.body.appendChild(testContainer)

        const saveAppendTo = tippy.defaults.appendTo
        tippy.defaults.appendTo = () => document.querySelector('#test-container')

        let tip = tippy(el)
        el._tippy.show()

        expect(testContainer.contains(el._tippy.popper)).toBe(true)

        // Simulate a DOM mutation that removes the previous appendTo element,
        // destroys poppers and reinitializes tippy with set defaults
        document.body.removeChild(testContainer)
        tip.destroyAll()

        testContainer = document.createElement('div')
        testContainer.id = 'test-container'
        document.body.appendChild(testContainer)

        // NOTE: Ideally, we should be able to move the
        // tippy initialization **before** creating a new #test-container,
        // to test that parent DOM is always evaluated when adding poppers.
        // But being able to evaluate to the new #test-container
        // during reinitialization is good enough.
        tip = tippy(el)

        // Should still append the popper to the newly created element
        // of the same selector (instead of the previously deleted one)
        el._tippy.show()

        expect(testContainer.contains(el._tippy.popper)).toBe(true)

        document.body.removeChild(testContainer)
        tip.destroyAll()
        tippy.defaults.appendTo = saveAppendTo
      })
    })

    describe('animation', () => {
      it('sets the `data-animation` attribute on the tooltip', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          animation: 'fade'
        })

        expect(el._tippy.popper.querySelector(selectors.TOOLTIP).getAttribute('data-animation')).toBe('fade')
        tip.destroyAll()
      })
    })

    describe('arrow', () => {
      it('creates a .tippy-arrow element as a child of the tooltip', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          arrow: true
        })

        expect(el._tippy.popper.querySelector(selectors.TOOLTIP).querySelector(selectors.ARROW)).not.toBeNull()
        tip.destroyAll()
      })
    })

    describe('animateFill', () => {
      it('is disabled if `arrow` is true', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          arrow: true
        })

        expect(el._tippy.popper.querySelector(selectors.TOOLTIP).querySelector(selectors.BACKDROP)).toBeNull()
        tip.destroyAll()
      })
    })

    describe('delay', () => {
      it('delays a tooltip from showing', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          delay: 20
        })

        el.dispatchEvent(new Event('mouseenter'))

        expect(el._tippy.popper.style.visibility).toBe('')

        tip.destroyAll()
      })
    })

    describe('trigger', () => {
      it('works for each 3 main: mouseenter, focus, click', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          duration: 0,
          trigger: 'mouseenter focus click'
        })

        el.dispatchEvent(new Event('mouseenter'))
        expect(el._tippy.popper.style.visibility).toBe('visible')
        el._tippy.hide()

        el.dispatchEvent(new Event('focus'))
        expect(el._tippy.popper.style.visibility).toBe('visible')
        el._tippy.hide()

        el.dispatchEvent(new Event('click'))
        expect(el._tippy.popper.style.visibility).toBe('visible')
        el._tippy.hide()

        tip.destroyAll()
      })

      it('hides on opposite trigger', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          duration: 0,
          trigger: 'mouseenter click'
        })
        el._tippy.show()

        el.dispatchEvent(new Event('mouseleave'))
        expect(el._tippy.state.visible).toBe(false)
        el._tippy.show()

        el.dispatchEvent(new Event('click'))
        expect(el._tippy.state.visible).toBe(false)

        tip.destroyAll()
      })
    })

    describe('interactive', () => {
      let hideFired = false

      beforeEach(done => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          duration: 0,
          trigger: 'click',
          interactive: true,
          onShow() {
            setTimeout(() => {
              !el._tippy.state.destroyed && done()
            }, 50)
          },
          onHide() {
            hideFired = true
            tip.destroyAll()
            done()
          }
        })
        el._tippy.show()
        el._tippy.popper.dispatchEvent(new Event('click'))
      })

      it('prevents a tooltip from closing when clicked on', () => {
        expect(hideFired).toBe(false)
      })
    })

    describe('placement', () => {
      it('sets the correct `placement` setting in Popper.js config', () => {
        ;['top', 'bottom', 'left', 'right'].forEach(placement => {
          const el = createVirtualElement()

          const tip = tippy(el, {
            placement,
            createPopperInstanceOnInit: true
          })

          expect(el._tippy.popperInstance.options.placement).toBe(placement)

          ;['-start', '-end'].forEach(shift => {
            const el = createVirtualElement()

            const tip = tippy(el, {
              placement: placement + shift,
              createPopperInstanceOnInit: true
            })

            expect(el._tippy.popperInstance.options.placement).toBe(placement + shift)
          })
        })
      })
    })

    describe('zIndex', () => {
      it('is applied to the tooltip popper element', () => {
        const el = createVirtualElement()

        const tip = tippy(el, {
          zIndex: 10
        })

        expect(el._tippy.popper.style.zIndex).toBe('10')

        tip.destroyAll()
      })
    })

    describe('dynamicTitle', () => {
      let instance, popper, currentContent

      beforeEach(done => {
        const el = createVirtualElement()

        tip = tippy(el, {
          dynamicTitle: true
        })

        popper = el._tippy.popper
        currentContent = popper.querySelector(selectors.CONTENT).innerHTML

        el.setAttribute('title', 'new')

        defer(done)
      })

      it('updates the tooltip content if the title attribute changed', () => {
        const newContent = popper.querySelector(selectors.CONTENT).innerHTML
        expect(currentContent).not.toBe(newContent)

        tip.destroyAll()
      })
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
      handleTrigger() {},
      handleMouseleave() {},
      handleBlur() {}
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

      const tip = tippy(el)
      const tippyInstance = tip.tooltips[0]

      expect(tippyInstance.options.duration).not.toBe(tip.options.duration)
    })

    it('does not override instance options if `performance` is true', () => {
      const el = createVirtualElement()
      el.setAttribute('data-tippy-duration', '1000')

      const tip = tippy(el, { performance: true })

      expect(tip.tooltips[0].options.duration).toBe(tip.options.duration)
    })
  })
})

describe('utils', () => {
  describe('transformAxisBasedOnPlacement', () => {
    it('correctly transforms the scale/translate axis', () => {
      expect(transformAxisBasedOnPlacement('X', true)).toBe('X')
      expect(transformAxisBasedOnPlacement('X', false)).toBe('Y')
      expect(transformAxisBasedOnPlacement('Y', true)).toBe('Y')
      expect(transformAxisBasedOnPlacement('Y', false)).toBe('X')
      expect(transformAxisBasedOnPlacement('', false)).toBe('')
      expect(transformAxisBasedOnPlacement('', true)).toBe('')
    })
  })
  
  describe('transformNumbersBasedOnPlacement', () => {
    it('correctly transforms scale with 1 number', () => {
      expect(transformNumbersBasedOnPlacement('scale', [0.5], true, false)).toBe('0.5')
    })
    
    it('correctly transforms scale with 2 numbers', () => {
      expect(transformNumbersBasedOnPlacement('scale', [0.5,0.9], true, false)).toBe('0.5, 0.9')
      expect(transformNumbersBasedOnPlacement('scale', [0.5,0.9], false, false)).toBe('0.9, 0.5')
    })
    
    it('correctly transforms translate numbers with 1 number', () => {
      expect(transformNumbersBasedOnPlacement('translate', [0.5], false, false)).toBe('0.5px')
      expect(transformNumbersBasedOnPlacement('translate', [0.5], false, true)).toBe('-0.5px')
    })
    
    it('correctly transforms translate numbers with 2 numbers', () => {
      expect(transformNumbersBasedOnPlacement('translate', [0.5,1], true, false)).toBe('0.5px, 1px')
      expect(transformNumbersBasedOnPlacement('translate', [0.5,1], true, true)).toBe('0.5px, -1px')
      expect(transformNumbersBasedOnPlacement('translate', [0.5,1], false, true)).toBe('-1px, 0.5px')
      expect(transformNumbersBasedOnPlacement('translate', [0.5,1], false, false)).toBe('1px, 0.5px')
    })
  })
  
  describe('getPopperPlacement', () => {
    const popper = document.createElement('div')
    
    it('returns the non-shifted placement for all combinations', () => {
      ['top', 'bottom', 'left', 'right'].forEach(placement => {
        popper.setAttribute('x-placement', placement)
        
        expect(
          getPopperPlacement(popper)
        ).toBe(placement)

        ;['-start', '-end'].forEach(shift => {
          popper.setAttribute('x-placement', placement + shift)
          
          expect(
            getPopperPlacement(popper)
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

  describe('isObjectLiteral', () => {
    it('correctly determines if the input is a true object literal', () => {
      expect(isObjectLiteral({})).toBe(true)
      expect(isObjectLiteral([])).toBe(false)
      expect(isObjectLiteral('')).toBe(false)
      expect(isObjectLiteral(window)).toBe(false)
      expect(isObjectLiteral(document.createElement('div'))).toBe(false)
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

  describe('applyTransitionDuration', () => {
    it('applies a transition duration to a list of elements', () => {
      const el1 = createVirtualElement()
      const el2 = createVirtualElement()

      applyTransitionDuration([el1, el2], 100)

      expect(el1.style[prefix('transitionDuration')]).toBe('100ms')
      expect(el2.style[prefix('transitionDuration')]).toBe('100ms')
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
