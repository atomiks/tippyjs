import { h, cleanDocumentBody } from '../utils'

import { defaultProps } from '../../src/props'
import {
  createPopperElement,
  updatePopperElement,
  createArrowElement,
  createBackdropElement,
  getChildren,
  addInertia,
  removeInertia,
  addInteractive,
  removeInteractive,
  setInnerHTML,
  setContent,
  isCursorOutsideInteractiveBorder,
  getBasePlacement,
  updateTheme,
} from '../../src/popper'
import { div } from '../../src/utils'
import {
  POPPER_SELECTOR,
  BACKDROP_SELECTOR,
  ARROW_SELECTOR,
  SVG_ARROW_SELECTOR,
} from '../../src/constants'

afterEach(cleanDocumentBody)

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
    expect(getChildren(popper).tooltip.id).toBe(`__NAMESPACE_PREFIX__-${id}`)
  })

  it('sets the `role` attribute correctly', () => {
    const popper = createPopperElement(1, defaultProps)
    expect(getChildren(popper).tooltip.getAttribute('role')).toBe('tooltip')
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
      animation: 'scale',
    })

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

  it('sets [data-state="hidden"] on tooltip and content elements', () => {
    const popper = createPopperElement(1, defaultProps)
    const { tooltip, content } = getChildren(popper)

    expect(tooltip.getAttribute('data-state')).toBe('hidden')
    expect(content.getAttribute('data-state')).toBe('hidden')
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

  it('updates animation attribute', () => {
    const popper = createPopperElement(1, defaultProps)

    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      animation: 'scale',
    })

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

  describe('diffs animateFill correclty', () => {
    it('true -> false', () => {
      const props = { ...defaultProps, animateFill: true }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, {
        ...defaultProps,
        animateFill: false,
      })

      expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
        false,
      )
    })

    it('false -> true', () => {
      const props = { ...defaultProps, animateFill: false }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, {
        ...defaultProps,
        animateFill: true,
      })

      expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
        true,
      )
    })
  })

  describe('diffs the arrow correctly', () => {
    it('true -> false', () => {
      const props = { ...defaultProps, arrow: true }
      const popper = createPopperElement(1, props)
      updatePopperElement(popper, props, { ...defaultProps, arrow: false })

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null)

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(false)
    })

    it('false -> true', () => {
      const props = { ...defaultProps, arrow: false }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, { ...defaultProps, arrow: true })

      expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null)
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null)

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true)
    })

    it('false -> "round"', () => {
      const props = { ...defaultProps, arrow: false }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, { ...defaultProps, arrow: 'round' })

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).not.toBe(null)

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true)
    })

    it('"round" -> false', () => {
      const props = { ...defaultProps, arrow: 'round' }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, { ...defaultProps, arrow: false })

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null)

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(false)
    })

    it('"round" -> true', () => {
      const props = { ...defaultProps, arrow: 'round' }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, { ...defaultProps, arrow: true })

      expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null)
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null)

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true)
    })

    it('"round" -> custom', () => {
      const props = { ...defaultProps, arrow: 'round' }
      const popper = createPopperElement(1, props)

      updatePopperElement(popper, props, {
        ...defaultProps,
        arrow: document.createElement('article'),
      })

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null)
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).not.toBe(null)
      expect(popper.querySelector('article')).not.toBe(null)
      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true)
    })
  })

  it('sets interactive attribute', () => {
    const popper = createPopperElement(1, defaultProps)
    const newProps = {
      ...defaultProps,
      interactive: true,
    }

    updatePopperElement(popper, defaultProps, newProps)

    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      true,
    )

    updatePopperElement(popper, newProps, {
      ...newProps,
      interactive: false,
    })

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
    const classList = getChildren(popper).tooltip.classList

    updatePopperElement(popper, defaultProps, newProps)

    expect(classList.contains('my-theme')).toBe(true)
    expect(classList.contains('custom-theme')).toBe(true)
    expect(classList.contains('themes-theme')).toBe(true)

    updatePopperElement(popper, newProps, {
      ...newProps,
      theme: 'other',
    })

    expect(classList.contains('my-theme')).toBe(false)
    expect(classList.contains('custom-theme')).toBe(false)
    expect(classList.contains('themes-theme')).toBe(false)
    expect(classList.contains('other-theme')).toBe(true)
  })
})

describe('addInteractive', () => {
  it('adds interactive attributes', () => {
    const tooltip = div()

    addInteractive(tooltip)

    expect(tooltip.hasAttribute('data-interactive')).toBe(true)
  })
})

describe('removeInteractive', () => {
  it('removes interactive attributes', () => {
    const tooltip = div()

    addInteractive(tooltip)
    removeInteractive(tooltip)

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
      arrow: 'round',
    })
    const children = getChildren(popper)

    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.arrow).toBeDefined()
  })
})

describe('createArrowElement', () => {
  it('returns a sharp arrow by default', () => {
    const arrow = createArrowElement(defaultProps.arrow)
    expect(arrow.matches(ARROW_SELECTOR)).toBe(true)
  })

  it('returns a round arrow if "round" is passed as argument', () => {
    const roundArrow = createArrowElement('round')
    expect(roundArrow.matches(SVG_ARROW_SELECTOR)).toBe(true)
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

    setContent(ref, { allowHTML: false, content })

    expect(ref.textContent).toBe(content)
    expect(ref.querySelector('strong')).toBe(null)
  })

  it('sets innerHTML of an element if `props.allowHTML` is `true`', () => {
    const ref = h()
    const content = '<strong>some content</strong>'

    setContent(ref, { allowHTML: true, content })

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
  const props = { interactiveBorder: 5, distance: 10 }
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
        isCursorOutsideInteractiveBorder('top', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('top', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('bottom', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('bottom', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('left', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('left', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('right', popperRect, coords, props),
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
        isCursorOutsideInteractiveBorder('right', popperRect, coords, props),
      ).toBe(true)
    })
  })
})

describe('getBasePlacement', () => {
  it('returns the base value without shifting', () => {
    const allPlacements = ['top', 'bottom', 'left', 'right'].reduce(
      (acc, basePlacement) => [
        ...acc,
        `${basePlacement}-start`,
        `${basePlacement}-end`,
      ],
    )

    allPlacements.forEach(placement => {
      expect(getBasePlacement(placement).endsWith('-start')).toBe(false)
      expect(getBasePlacement(placement).endsWith('-end')).toBe(false)
    })
  })

  it('returns an empty string if there is no placement', () => {
    expect(getBasePlacement('')).toBe('')
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

  it('does not add a `-theme` class if the theme is an empty string', () => {
    const div = document.createElement('div')

    updateTheme(div, 'add', '')

    expect(div.className).toBe('')
  })
})
