import { BROWSER, DEFAULT_SETTINGS, SELECTORS } from '../../src/js/core/constants'

import init from '../../src/js/core/init'

import noop                     from '../../src/js/utils/noop'
import getCorePlacement         from '../../src/js/utils/getCorePlacement'
import find                     from '../../src/js/utils/find'
import prefix                   from '../../src/js/utils/prefix'
import closest                  from '../../src/js/utils/closest'
import isVisible                from '../../src/js/utils/isVisible'
import getOffsetDistanceInPx    from '../../src/js/utils/getOffsetDistanceInPx'
import modifyClassList          from '../../src/js/utils/modifyClassList'
import applyTransitionDuration  from '../../src/js/utils/applyTransitionDuration'
import cursorIsOutsideInteractiveBorder from '../../src/js/utils/cursorIsOutsideInteractiveBorder'

import followCursorHandler              from '../../src/js/core/createTrigger'
import createTrigger                    from '../../src/js/core/createTrigger'
import onTransitionEnd                  from '../../src/js/core/onTransitionEnd'
import mountPopper                      from '../../src/js/core/mountPopper'
import makeSticky                       from '../../src/js/core/makeSticky'
import createPopperElement              from '../../src/js/core/createPopperElement'
import createPopperInstance             from '../../src/js/core/createPopperInstance'
import getArrayOfElementsFromSelector   from '../../src/js/core/getArrayOfElementsFromSelector'

import tippy from '../../src/js/tippy.js'

const createVirtualElement = () => {
    const el = document.createElement('div')
    el.className = 'test'
    el.setAttribute('title', 'tooltip')
    return el
}

describe('core', () => {

    describe('init', () => {
        it('runs only once', () => {
            init()
            expect(init()).toBe(false)
        })

        const el = createVirtualElement()

        const instance = tippy(el, { duration:0 })
        const popper = instance.getPopperElement(el)

        instance.show(popper)

        document.dispatchEvent(new MouseEvent('click'))
        window.TouchEvent && document.dispatchEvent(new TouchEvent('touchstart'))

        it('sets up the document click listener properly', () => {
            expect(document.querySelector(SELECTORS.popper)).toBeNull()
        })

        it('sets BROWSER.touch to be true upon touchstart, keeps it false if does not support touch', () => {
            window.TouchEvent ? expect(BROWSER.touch).toBe(true)
                              : expect(BROWSER.touch).toBe(false)

            BROWSER.touch = false
        })

        it('adds .tippy-touch class to body if iOS, does not if not', () => {
            BROWSER.iOS ? expect(document.body.classList).toContain('tippy-touch')
                        : expect(document.body.classList).not.toContain('tippy-touch')
        })

        instance.destroyAll()
    })

    describe('tippy', () => {
        it('does not mutate the default settings', () => {
            const settingsClone = Object.assign({}, DEFAULT_SETTINGS)

            const el = createVirtualElement()

            const instance = tippy(el, {
                delay: 1000,
                duration: 0,
                popperOptions: {
                    modifiers: {}
                }
            })

            expect(
                Object.keys(settingsClone).every(key => settingsClone[key] === DEFAULT_SETTINGS[key])
            ).toBe(true)

            expect(DEFAULT_SETTINGS.popperOptions.modifiers).toBeUndefined()

            instance.destroyAll()
        })

        it('works for a DOM element', () => {
            const el = createVirtualElement()

            const instance = tippy(el)
            expect(el.hasAttribute('data-tooltipped')).toBe(true)

            instance.destroyAll()
        })

        it('works for a CSS selector', () => {
            const el = createVirtualElement()

            document.body.appendChild(el)

            const instance = tippy('.test')
            expect(el.hasAttribute('data-tooltipped')).toBe(true)

            document.body.removeChild(el)

            instance.destroyAll()
        })

        it('will not affect elements with an empty title attribute and no html', () => {
            const el = createVirtualElement()
            el.setAttribute('title', '')

            const instance = tippy(el)

            expect(el.hasAttribute('data-tooltipped')).toBe(false)

            instance.destroyAll()
        })

        it('removes the title from the element', () => {
            const el = createVirtualElement()

            const instance = tippy(el)

            expect(!!el.getAttribute('title')).toBe(false)

            instance.destroyAll()
        })

        it('composes custom settings with the default settings', () => {
            const el = createVirtualElement()

            const instance = tippy(el, {
                position: 'bottom',
                delay: [100, 200]
            })

            expect(
                instance.settings.position === 'bottom' &&
                instance.settings.delay[0] === 100 &&
                instance.settings.html === DEFAULT_SETTINGS.html
            ).toBe(true)

            instance.destroyAll()
        })

        describe('callbacks', () => {

            const el = createVirtualElement()

            let counter = 1
            let show, shown, hide, hidden
            let showThis, shownThis, hideThis, hiddenThis

            beforeEach(done => {

                let popper

                const instance = tippy(el, {
                    duration: 0,
                    show() {
                        show = counter
                        showThis = this === popper
                        counter++
                    },
                    shown() {
                        shown = counter
                        shownThis = this === popper
                        counter++
                        instance.hide(popper)
                    },
                    hide() {
                        hide = counter
                        hideThis = this === popper
                        counter++
                        hideCalled = true
                    },
                    hidden() {
                        hidden = counter
                        hiddenThis = this === popper
                        counter++
                        hiddenCalled = true
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

                const popper = instance.getPopperElement(el)

                el.dispatchEvent(new MouseEvent('mouseenter'))
                popperStaysHidden = popper.style.visibility !== 'visible'
            })

            it('should work', () => {
                expect(
                    showIsAFunction && eventIsAnEventObject && popperStaysHidden
                ).toBe(true)
            })
        })

        describe('getPopperElement', () => {
            it('returns the popper from its element reference', () => {
                const el = createVirtualElement()

                const instance = tippy(el)

                expect(
                    instance.getPopperElement(el).classList
                ).toContain('tippy-popper')

                instance.destroyAll()
            })
        })

        describe('getReferenceElement', () => {
            it('returns the reference element from its popper reference', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const popper = instance.getPopperElement(el)

                expect(
                    instance.getReferenceElement(popper).className
                ).toBe('test')

                instance.destroyAll()
            })
        })

        describe('getReferenceObject', () => {
            it('returns the reference object with either the ref el or popper as the argument', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const ref = instance.getReferenceObject(el)
                const ref2 = instance.getReferenceObject(instance.getPopperElement(el))

                ;[ref, ref2].forEach(ref => {
                    expect(ref.toString()).toBe('[object Object]')
                    expect(ref.popper).toBeDefined()
                })

                instance.destroyAll()
            })
        })

        describe('destroyAll', () => {
            it('should destroy all tooltips created by the instance', () => {
                const el = createVirtualElement()

                const instance = tippy(el)

                instance.destroyAll()

                expect(instance.state.destroyed).toBe(true)
                expect(instance.store).toBeNull()
            })
        })

        describe('destroy', () => {
            it('restores the title on the element', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const popper = instance.getPopperElement(el)

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
                const popper = instance.getPopperElement(el)

                instance.destroy(popper)

                el.dispatchEvent(new MouseEvent('mouseenter'))

                expect(test).toBe(true)
                expect(document.querySelector(SELECTORS.popper)).toBeNull()
            })

            it('removes the ref object from store', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const popper = instance.getPopperElement(el)

                instance.destroy(popper)

                expect(instance.getReferenceObject(el)).toBeUndefined()
            })
        })

        describe('show', () => {
            it('shows a tooltip when manually invoked', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const popper = instance.getPopperElement(el)

                instance.show(popper)

                expect(popper.style.visibility).toBe('visible')

                instance.destroyAll()
            })

            it('shows a tooltip when triggered by one of the events in the trigger string', () => {
                const el = createVirtualElement()
                const instance = tippy(el, {
                    trigger: 'mouseenter click'
                })
                const popper = instance.getPopperElement(el)

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
            let blurWorked = false

            beforeEach(done => {
                if (!counter) return done()

                const el = createVirtualElement()

                let type = counter === 1 ? 'mouseleave' : 'blur'

                const instance = tippy(el, {
                    trigger: 'mouseenter focus',
                    hide() {
                        if (type === 'mouseleave') mouseleaveWorked = true
                        if (type === 'blur') blurWorked = true

                        done()
                    }
                })

                const popper = instance.getPopperElement(el)
                instance.show(popper, 0)

                if (type === 'blur') {
                    el.focus()
                }

                el.dispatchEvent(new MouseEvent(type))
            })

            it('hides a tooltip when manually invoked', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const popper = instance.getPopperElement(el)

                instance.hide(popper)

                expect(popper.style.visibility).toBe('hidden')

                instance.destroyAll()

                counter++
            })

            it('hides a tooltip when mouseleave event is fired', () => {
                expect(mouseleaveWorked).toBe(true)
                counter++
            })

            it('hides a tooltip when blur event is fired', () => {
                expect(blurWorked).toBe(true)
            })
        })

        describe('update', () => {
            it('updates a tooltip with new content if the title attribute has changed', () => {
                const el = createVirtualElement()

                const instance = tippy(el)
                const popper = instance.getPopperElement(el)

                el.setAttribute('title', 'new')
                instance.update(popper)

                expect(popper.querySelector(SELECTORS.content).innerHTML).toBe('new')

                instance.destroyAll()
            })

            it('injects new HTML if appropriate', () => {
                const el = createVirtualElement()
                const html = document.createElement('div')
                html.id = 'test-template'
                html.innerHTML = 'test'

                document.body.appendChild(html)

                const instance = tippy(el, {
                    html: '#test-template'
                })

                html.innerHTML = 'new'

                const popper = instance.getPopperElement(el)
                instance.update(popper)

                expect(popper.querySelector(SELECTORS.content).innerHTML).toBe('new')

                instance.destroyAll()
                document.body.removeChild(html)
            })
        })
    })

    describe('createPopperInstance', () => {

        it('returns a new Popper instance', () => {
            const el = createVirtualElement()

            const instance = tippy(el)
            const ref = instance.getReferenceObject(el)

            const popperInstance = createPopperInstance(ref)

            expect(typeof popperInstance.update).toBe('function')

            instance.destroyAll()
        })
    })

    describe('getArrayOfElementsFromSelector', () => {
        it('returns an array of HTMLElements', () => {
            const el1 = createVirtualElement()
            const el2 = createVirtualElement()

            document.body.appendChild(el2)

            const res1 = getArrayOfElementsFromSelector(el1)
            const res2 = getArrayOfElementsFromSelector('.test')

            ;[res1, res2].forEach(res =>
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

            if (BROWSER.supportsTouch) {
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

        const settings = {
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
                    settings
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
                    settings
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
                    settings
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
                    settings
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
                    settings
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
                    settings
                )
            ).toBe(true)

            expect(
                cursorIsOutsideInteractiveBorder(
                    {
                        clientX: 105,
                        clientY: 140
                    },
                    popper,
                    settings
                )
            ).toBe(true)

            document.body.removeChild(wrapper)
        })
    })

    describe('getIndividualSettings', () => {
        it('uses data-* attributes to override instance settings', () => {
            const el = createVirtualElement()
            el.setAttribute('data-duration', '1000')

            const instance = tippy(el)
            const ref = instance.getReferenceObject(el)

            expect(ref.settings.duration).not.toBe(instance.settings.duration)
        })

        it('does not override instance settings if `performance` is true', () => {
            const el = createVirtualElement()
            el.setAttribute('data-duration', '1000')

            const instance = tippy(el, { performance: true })
            const ref = instance.getReferenceObject(el)

            expect(ref.settings.duration).toBe(instance.settings.duration)
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
        const ref = instance.getReferenceObject(el)

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
            const ref = instance.getReferenceObject(el)

            mountPopper(ref)

            expect(document.querySelector(SELECTORS.popper)).not.toBeNull()

            const popper = instance.getPopperElement(el)
            popper.style.visibility = 'visible'
            instance.destroyAll()
        })

        it('creates a single popper instance on first mount', () => {
            const el = createVirtualElement()

            const instance = tippy(el)
            const ref = instance.getReferenceObject(el)

            mountPopper(ref)

            const cache = ref.popperInstance

            mountPopper(ref)

            expect(ref.popperInstance).toBeDefined()
            expect(ref.popperInstance).toBe(cache)

            ref.popper.style.visibility = 'visible'
            instance.destroyAll()
        })

        it('enables event listeners if `followCursor` is false or BROWSER.touch is true', () => {
            const el = createVirtualElement()

            let instance = tippy(el)
            let ref = instance.getReferenceObject(el)

            mountPopper(ref)

            expect(ref.popperInstance.state.eventsEnabled).toBe(true)

            ref.popper.style.visibility = 'visible'
            instance.destroyAll()

            BROWSER.touch = true

            instance = tippy(el, {
                followCursor: true
            })
            ref = instance.getReferenceObject(el)

            mountPopper(ref)

            expect(ref.popperInstance.state.eventsEnabled).toBe(true)

            ref.popper.style.visibility = 'visible'
            instance.destroyAll()
            BROWSER.touch = false
        })

        it('disables event listeners if `followCursor` is true', () => {
            const el = createVirtualElement()

            const instance = tippy(el, {
                followCursor: true
            })
            const ref = instance.getReferenceObject(el)

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

                ;['start', 'end'].forEach(shift => {
                    expect(
                        getCorePlacement(placement + '-' + shift)
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

    describe('modifyClassList', () => {
        it('modifies an element\'s class list', () => {

            const popper = document.createElement('div')
            popper.className = 'class1 class2 class3'

            modifyClassList([popper], list => {
                list.add('class4')
                list.remove('class1')
            })

            expect(popper.className).toBe('class2 class3 class4')
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
