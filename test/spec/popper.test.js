import { h, cleanDocumentBody } from '../utils'
import tippy from '../../src'
import { defaultProps } from '../../src/props'
import {
  createPopperElement,
  updatePopperElement,
  createArrowElement,
  createBackdropElement,
  hideAll,
  getChildren,
  addInertia,
  removeInertia,
  addInteractive,
  removeInteractive,
  setInnerHTML,
  setContent,
  isCursorOutsideInteractiveBorder,
  getOffsetDistanceInPx,
  getBasicPlacement,
  updateTheme,
} from '../../src/popper'
import { div } from '../../src/utils'
import {
  POPPER_SELECTOR,
  BACKDROP_SELECTOR,
  ARROW_SELECTOR,
  ROUND_ARROW_SELECTOR,
} from '../../src/constants'

jest.useFakeTimers()

tippy.setDefaults({ duration: 0, delay: 0 })

afterEach(cleanDocumentBody)

describe('hideAll', () => {
  it('hides all tippys on the document, ignoring `hideOnClick`', () => {
    const options = { showOnInit: true, hideOnClick: false }
    const instances = [...Array(3)].map(() => tippy(h(), options))
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(true)
    })
    jest.runAllTimers()
    hideAll()
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(false)
    })
  })

  it('respects `duration` option', () => {
    const options = { showOnInit: true, duration: 100 }
    const instances = [...Array(3)].map(() => tippy(h(), options))
    jest.runAllTimers()
    hideAll({ duration: 0 })
    instances.forEach(instance => {
      expect(instance.state.isMounted).toBe(false)
    })
  })

  it('respects `exclude` option', () => {
    const options = { showOnInit: true }
    const instances = [...Array(3)].map(() => tippy(h(), options))
    jest.runAllTimers()
    hideAll({ exclude: instances[0] })
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(
        instance === instances[0] ? true : false,
      )
    })
  })

  it('respects `exclude` option as type ReferenceElement for multiple tippys', () => {
    const options = { showOnInit: true, multiple: true }
    const ref = h()
    tippy(ref, options)
    tippy(ref, options)
    jest.runAllTimers()
    hideAll({ exclude: ref })
    const instances = [...document.querySelectorAll(POPPER_SELECTOR)].map(
      popper => popper._tippy,
    )
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(true)
    })
  })
})

describe('createPopperElement', () => {
  it('returns an element', () => {
    expect(createPopperElement(1, defaultProps) instanceof Element).toBe(true)
  })

  it('always creates a tooltip element child', () => {
    const popper = createPopperElement(1, defaultProps)
    expect(getChildren(popper).tooltip).not.toBe(null)
  })

  it('sets the `id` property correctly', () => {
    const id = 1829
    const popper = createPopperElement(id, defaultProps)
    expect(popper.id).toBe(`__NAMESPACE_PREFIX__-${id}`)
  })

  it('sets the `role` attribute correctly', () => {
    const popper = createPopperElement(1, defaultProps)
    expect(popper.getAttribute('role')).toBe('tooltip')
  })

  it('sets the className property correctly', () => {
    const popper = createPopperElement(1, defaultProps)
    expect(popper.matches(POPPER_SELECTOR)).toBe(true)
  })

  it('does not create an arrow element if props.arrow is false', () => {
    const popper = createPopperElement(1, { ...defaultProps, arrow: false })
    expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
  })

  it('creates an arrow element if props.arrow is true', () => {
    const popper = createPopperElement(1, { ...defaultProps, arrow: true })
    expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null)
  })

  it('does not create a backdrop element if props.animateFill is false', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      animateFill: false,
    })
    expect(popper.querySelector(BACKDROP_SELECTOR)).toBe(null)
  })

  it('sets `[data-animatefill]` on the tooltip element if props.animateFill is true', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      animateFill: true,
    })
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      true,
    )
  })

  it('sets `[data-interactive]` on the tooltip if props.interactive is true', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      interactive: true,
    })
    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      true,
    )
  })

  it('sets the correct data-* attributes on the tooltip based on props', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      size: 'large',
      animation: 'scale',
    })
    expect(getChildren(popper).tooltip.getAttribute('data-size')).toBe('large')
    expect(getChildren(popper).tooltip.getAttribute('data-animation')).toBe(
      'scale',
    )
  })

  it('sets the correct theme class names on the tooltip based on props', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      theme: 'red firetruck',
    })
    expect(getChildren(popper).tooltip.classList.contains('red-theme')).toBe(
      true,
    )
    expect(
      getChildren(popper).tooltip.classList.contains('firetruck-theme'),
    ).toBe(true)
  })
})

describe('updatePopperElement', () => {
  it('sets new zIndex', () => {
    const popper = createPopperElement(1, defaultProps)
    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      zIndex: 213,
    })
    expect(popper.style.zIndex).toBe('213')
  })

  it('updates size and animation attributes', () => {
    const popper = createPopperElement(1, defaultProps)
    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      size: 'large',
      animation: 'scale',
    })
    expect(getChildren(popper).tooltip.getAttribute('data-size')).toBe('large')
    expect(getChildren(popper).tooltip.getAttribute('data-animation')).toBe(
      'scale',
    )
  })

  it('sets new content', () => {
    const popper = createPopperElement(1, defaultProps)
    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      content: 'hello',
    })
    expect(getChildren(popper).content.textContent).toBe('hello')
    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      content: '<strong>hello</strong>',
    })
    expect(getChildren(popper).content.querySelector('strong')).not.toBe(null)
  })

  it('sets new backdrop element', () => {
    const popper = createPopperElement(1, defaultProps)
    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      animateFill: false,
    })
    expect(popper.querySelector(BACKDROP_SELECTOR)).toBe(null)
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      false,
    )
    updatePopperElement(
      popper,
      { ...defaultProps, animateFill: false },
      {
        ...defaultProps,
        animateFill: true,
      },
    )
    expect(popper.querySelector(BACKDROP_SELECTOR)).not.toBe(null)
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      true,
    )
  })

  it('sets new arrow element', () => {
    {
      const popper = createPopperElement(1, defaultProps)
      updatePopperElement(popper, defaultProps, {
        ...defaultProps,
        arrow: true,
      })
      expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null)
    }

    {
      const props = { ...defaultProps, arrow: true }
      const popper = createPopperElement(1, props)
      updatePopperElement(popper, props, {
        ...defaultProps,
        arrow: false,
      })
      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
    }
  })

  it('sets new arrow element type', () => {
    {
      const popper = createPopperElement(1, defaultProps)
      updatePopperElement(popper, defaultProps, {
        ...defaultProps,
        arrow: true,
        arrowType: 'round',
      })
      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
      expect(popper.querySelector(ROUND_ARROW_SELECTOR)).not.toBe(null)
    }

    {
      const props = { ...defaultProps, arrowType: 'round', arrow: true }
      const popper = createPopperElement(1, props)
      const newProps = { ...defaultProps, arrowType: 'sharp', arrow: true }
      updatePopperElement(popper, props, newProps)
      expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null)
      expect(popper.querySelector(ROUND_ARROW_SELECTOR)).toBe(null)
      updatePopperElement(popper, newProps, defaultProps)
      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
      expect(popper.querySelector(ROUND_ARROW_SELECTOR)).toBe(null)
    }
  })

  it('sets interactive attribute', () => {
    const popper = createPopperElement(1, defaultProps)
    const newProps = {
      ...defaultProps,
      interactive: true,
    }
    updatePopperElement(popper, defaultProps, newProps)
    expect(popper.getAttribute('tabindex')).toBe('-1')
    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      true,
    )
    updatePopperElement(popper, newProps, {
      ...newProps,
      interactive: false,
    })
    expect(popper.getAttribute('tabindex')).toBe(null)
    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      false,
    )
  })

  it('sets inertia attribute', () => {
    const popper = createPopperElement(1, defaultProps)
    const newProps = {
      ...defaultProps,
      inertia: true,
    }
    updatePopperElement(popper, defaultProps, newProps)
    expect(getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(true)
    updatePopperElement(popper, newProps, {
      ...newProps,
      inertia: false,
    })
    expect(getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(false)
  })

  it('sets new theme', () => {
    const popper = createPopperElement(1, defaultProps)
    const newProps = {
      ...defaultProps,
      theme: 'my custom themes',
    }
    updatePopperElement(popper, defaultProps, newProps)
    expect(getChildren(popper).tooltip.classList.contains('my-theme')).toBe(
      true,
    )
    expect(getChildren(popper).tooltip.classList.contains('custom-theme')).toBe(
      true,
    )
    expect(getChildren(popper).tooltip.classList.contains('themes-theme')).toBe(
      true,
    )
    updatePopperElement(popper, newProps, {
      ...newProps,
      theme: 'other',
    })
    expect(getChildren(popper).tooltip.classList.contains('my-theme')).toBe(
      false,
    )
    expect(getChildren(popper).tooltip.classList.contains('custom-theme')).toBe(
      false,
    )
    expect(getChildren(popper).tooltip.classList.contains('themes-theme')).toBe(
      false,
    )
    expect(getChildren(popper).tooltip.classList.contains('other-theme')).toBe(
      true,
    )
  })
})

describe('addInteractive', () => {
  it('adds interactive attributes', () => {
    const popper = div()
    const tooltip = div()
    addInteractive(popper, tooltip)
    expect(popper.getAttribute('tabindex')).toBe('-1')
    expect(tooltip.hasAttribute('data-interactive')).toBe(true)
  })
})

describe('removeInteractive', () => {
  it('removes interactive attributes', () => {
    const popper = div()
    const tooltip = div()
    addInteractive(popper, tooltip)
    removeInteractive(popper, tooltip)
    expect(popper.getAttribute('tabindex')).toBe(null)
    expect(tooltip.hasAttribute('data-interactive')).toBe(false)
  })
})

describe('addInertia', () => {
  it('adds inertia attribute', () => {
    const tooltip = div()
    addInertia(tooltip)
    expect(tooltip.hasAttribute('data-inertia')).toBe(true)
  })
})

describe('removeInertia', () => {
  it('removes inertia attribute', () => {
    const tooltip = div()
    addInertia(tooltip)
    removeInertia(tooltip)
    expect(tooltip.hasAttribute('data-ineria')).toBe(false)
  })
})

describe('getChildren', () => {
  it('returns the children of the popper element, default props', () => {
    const popper = createPopperElement(1, defaultProps)
    const children = getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.backdrop).toBeDefined()
  })

  it('returns the children of the popper element, with arrow', () => {
    const popper = createPopperElement(1, { ...defaultProps, arrow: true })
    const children = getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.arrow).toBeDefined()
  })

  it('returns the children of the popper element, with round arrow', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      arrow: true,
      arrowType: 'round',
    })
    const children = getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.arrow).toBeDefined()
  })
})

describe('createArrowElement', () => {
  it('returns a sharp arrow by default', () => {
    const arrow = createArrowElement()
    expect(arrow.matches(ARROW_SELECTOR)).toBe(true)
  })

  it('returns a round arrow if "round" is passed as argument', () => {
    const roundArrow = createArrowElement('round')
    expect(roundArrow.matches(ROUND_ARROW_SELECTOR)).toBe(true)
  })
})

describe('createBackdropElement', () => {
  it('returns a backdrop element', () => {
    const arrow = createBackdropElement()
    expect(arrow.matches(BACKDROP_SELECTOR)).toBe(true)
    expect(arrow.getAttribute('data-state')).toBe('hidden')
  })
})

describe('setContent', () => {
  it('sets textContent of an element if `props.allowHTML` is `false`', () => {
    const ref = h()
    const content = 'some content'
    setContent(ref, {
      allowHTML: false,
      content,
    })
    expect(ref.textContent).toBe(content)
    expect(ref.querySelector('strong')).toBe(null)
  })

  it('sets innerHTML of an element if `props.allowHTML` is `true`', () => {
    const ref = h()
    const content = '<strong>some content</strong>'
    setContent(ref, {
      allowHTML: true,
      content,
    })
    expect(ref.querySelector('strong')).not.toBe(null)
  })
})

describe('setInnerHTML', () => {
  it('sets the innerHTML of an element with a string', () => {
    const ref = h()
    setInnerHTML(ref, '<strong></strong>')
    expect(ref.querySelector('strong')).not.toBe(null)
  })

  it('sets the innerHTML of an element with an element', () => {
    const ref = h()
    const div = document.createElement('div')
    div.innerHTML = '<strong></strong>'
    setInnerHTML(ref, div)
    expect(ref.querySelector('strong')).not.toBe(null)
  })
})

describe('isCursorOutsideInteractiveBorder', () => {
  const options = { interactiveBorder: 5, distance: 10 }
  const popperRect = { top: 100, left: 100, right: 110, bottom: 110 }

  it('no popper placement returns true', () => {
    expect(isCursorOutsideInteractiveBorder(null, {}, {}, {})).toBe(true)
  })

  // TOP: bounded by x(95, 115) and y(95, 115)
  it('PLACEMENT=top: inside', () => {
    const mockEvents = [
      { clientX: 95, clientY: 95 },
      { clientX: 115, clientY: 115 },
      { clientX: 115, clientY: 95 },
      { clientX: 95, clientY: 115 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('top', popperRect, coords, options),
      ).toBe(false)
    })
  })

  // TOP: bounded by x(95, 115) and y(95, 115)
  it('PLACEMENT=top: outside', () => {
    const mockEvents = [
      { clientX: 94, clientY: 84 },
      { clientX: 94, clientY: 126 },
      { clientX: 100, clientY: 84 },
      { clientX: 100, clientY: 126 },
      { clientX: 94, clientY: 100 },
      { clientX: 116, clientY: 100 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('top', popperRect, coords, options),
      ).toBe(true)
    })
  })

  // BOTTOM: bounded by x(95, 115) and y(95, 125])
  it('PLACEMENT=bottom: inside', () => {
    const mockEvents = [
      { clientX: 95, clientY: 95 },
      { clientX: 115, clientY: 125 },
      { clientX: 115, clientY: 125 },
      { clientX: 95, clientY: 125 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('bottom', popperRect, coords, options),
      ).toBe(false)
    })
  })

  // BOTTOM: bounded by x(95, 115) and y(95, 125)
  it('PLACEMENT=bottom: outside', () => {
    const mockEvents = [
      { clientX: 94, clientY: 94 },
      { clientX: 94, clientY: 126 },
      { clientX: 100, clientY: 94 },
      { clientX: 100, clientY: 126 },
      { clientX: 94, clientY: 100 },
      { clientX: 116, clientY: 100 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('bottom', popperRect, coords, options),
      ).toBe(true)
    })
  })

  // LEFT: bounded by x(85, 115) and y(95, 115)
  it('PLACEMENT=left: inside', () => {
    const mockEvents = [
      { clientX: 85, clientY: 95 },
      { clientX: 115, clientY: 95 },
      { clientX: 85, clientY: 115 },
      { clientX: 115, clientY: 115 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('left', popperRect, coords, options),
      ).toBe(false)
    })
  })

  // LEFT: bounded by x(85, 115) and y(95, 115)
  it('PLACEMENT=left: outside', () => {
    const mockEvents = [
      { clientX: 84, clientY: 94 },
      { clientX: 84, clientY: 116 },
      { clientX: 100, clientY: 94 },
      { clientX: 100, clientY: 116 },
      { clientX: 84, clientY: 100 },
      { clientX: 116, clientY: 100 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('left', popperRect, coords, options),
      ).toBe(true)
    })
  })

  // RIGHT: bounded by x(95, 125) and y(95, 115)
  it('PLACEMENT=right: inside', () => {
    const mockEvents = [
      { clientX: 95, clientY: 95 },
      { clientX: 125, clientY: 95 },
      { clientX: 95, clientY: 115 },
      { clientX: 125, clientY: 115 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('right', popperRect, coords, options),
      ).toBe(false)
    })
  })

  // RIGHT: bounded by x(95, 125) and y(95, 115)
  it('PLACEMENT=right: outside', () => {
    const mockEvents = [
      { clientX: 94, clientY: 94 },
      { clientX: 94, clientY: 126 },
      { clientX: 100, clientY: 94 },
      { clientX: 100, clientY: 126 },
      { clientX: 94, clientY: 100 },
      { clientX: 126, clientY: 100 },
    ]

    mockEvents.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder('right', popperRect, coords, options),
      ).toBe(true)
    })
  })
})

describe('getOffsetDistanceInPx', () => {
  it('returns 0px by default', () => {
    expect(getOffsetDistanceInPx(defaultProps.distance)).toBe('0px')
  })

  it('returns -10px if the distance is 20', () => {
    expect(getOffsetDistanceInPx(20)).toBe('-10px')
  })

  it('returns 5px if the distance is 5', () => {
    expect(getOffsetDistanceInPx(5)).toBe('5px')
  })

  it('returns 18px if the distance is -8', () => {
    expect(getOffsetDistanceInPx(-8)).toBe('18px')
  })
})

describe('getPopperPlacement', () => {
  it('returns the base value without shifting', () => {
    const allPlacements = ['top', 'bottom', 'left', 'right'].reduce(
      (acc, basePlacement) => [
        ...acc,
        `${basePlacement}-start`,
        `${basePlacement}-end`,
      ],
    )

    allPlacements.forEach(placement => {
      const popper = h('div')
      popper.setAttribute('x-placement', placement)
      expect(getBasicPlacement(popper).endsWith('-start')).toBe(false)
      expect(getBasicPlacement(popper).endsWith('-end')).toBe(false)
    })
  })

  it('returns an empty string if there is no placement', () => {
    const popper = h('div')
    expect(getBasicPlacement(popper)).toBe('')
  })
})

describe('updateTheme', () => {
  it('updates the theme on an element correctly', () => {
    const div = document.createElement('div')
    const theme = 'hello world'
    updateTheme(div, 'add', theme)
    expect(div.className).toBe('hello-theme world-theme')
    updateTheme(div, 'remove', theme)
    expect(div.className).toBe('')
  })
})
