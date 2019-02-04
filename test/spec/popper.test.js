import { h, cleanDocumentBody } from '../utils'
import tippy from '../../src/js/index'
import Defaults from '../../src/js/defaults'
import Selectors from '../../src/js/selectors'
import {
  createPopperElement,
  updatePopperElement,
  afterPopperPositionUpdates,
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
  applyTransitionDuration,
  setVisibilityState,
  isCursorOutsideInteractiveBorder,
  getOffsetDistanceInPx,
  getPopperPlacement,
  div,
} from '../../src/js/popper'

afterEach(cleanDocumentBody)

describe('hideAll', () => {
  // todo
})

describe('createPopperElement', () => {
  it('returns an element', () => {
    expect(createPopperElement(1, Defaults) instanceof Element).toBe(true)
  })

  it('always creates a tooltip element child', () => {
    const popper = createPopperElement(1, Defaults)
    expect(getChildren(popper).tooltip).not.toBe(null)
  })

  it('sets the `id` property correctly', () => {
    const id = 1829
    const popper = createPopperElement(id, Defaults)
    expect(popper.id).toBe(`tippy-${id}`)
  })

  it('sets the `role` attribute correctly', () => {
    const popper = createPopperElement(1, Defaults)
    expect(popper.getAttribute('role')).toBe('tooltip')
  })

  it('sets the className property correctly', () => {
    const popper = createPopperElement(1, Defaults)
    expect(popper.matches(Selectors.POPPER)).toBe(true)
  })

  it('does not create an arrow element if props.arrow is false', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: false })
    expect(popper.querySelector(Selectors.ARROW)).toBe(null)
  })

  it('creates an arrow element if props.arrow is true', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: true })
    expect(popper.querySelector(Selectors.ARROW)).not.toBe(null)
  })

  it('does not create a backdrop element if props.animateFill is false', () => {
    const popper = createPopperElement(1, {
      ...Defaults,
      animateFill: false,
    })
    expect(popper.querySelector(Selectors.BACKDROP)).toBe(null)
  })

  it('sets `[data-animatefill]` on the tooltip element if props.animateFill is true', () => {
    const popper = createPopperElement(1, {
      ...Defaults,
      animateFill: true,
    })
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      true,
    )
  })

  it('sets `[data-interactive]` on the tooltip if props.interactive is true', () => {
    const popper = createPopperElement(1, {
      ...Defaults,
      interactive: true,
    })
    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      true,
    )
  })

  it('sets the correct data-* attributes on the tooltip based on props', () => {
    const popper = createPopperElement(1, {
      ...Defaults,
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
      ...Defaults,
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
    const popper = createPopperElement(1, Defaults)
    updatePopperElement(popper, Defaults, {
      ...Defaults,
      zIndex: 213,
    })
    expect(popper.style.zIndex).toBe('213')
  })

  it('updates size and animation attributes', () => {
    const popper = createPopperElement(1, Defaults)
    updatePopperElement(popper, Defaults, {
      ...Defaults,
      size: 'large',
      animation: 'scale',
    })
    expect(getChildren(popper).tooltip.getAttribute('data-size')).toBe('large')
    expect(getChildren(popper).tooltip.getAttribute('data-animation')).toBe(
      'scale',
    )
  })

  it('sets new content', () => {
    const popper = createPopperElement(1, Defaults)
    updatePopperElement(popper, Defaults, {
      ...Defaults,
      content: 'hello',
    })
    expect(getChildren(popper).content.textContent).toBe('hello')
    updatePopperElement(popper, Defaults, {
      ...Defaults,
      content: '<strong>hello</strong>',
    })
    expect(getChildren(popper).content.querySelector('strong')).not.toBe(null)
  })

  it('sets new backdrop element', () => {
    const popper = createPopperElement(1, Defaults)
    updatePopperElement(popper, Defaults, {
      ...Defaults,
      animateFill: false,
    })
    expect(popper.querySelector(Selectors.BACKDROP)).toBe(null)
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      false,
    )
    updatePopperElement(
      popper,
      { ...Defaults, animateFill: false },
      {
        ...Defaults,
        animateFill: true,
      },
    )
    expect(popper.querySelector(Selectors.BACKDROP)).not.toBe(null)
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      true,
    )
  })

  it('sets new arrow element', () => {
    {
      const popper = createPopperElement(1, Defaults)
      updatePopperElement(popper, Defaults, {
        ...Defaults,
        arrow: true,
      })
      expect(popper.querySelector(Selectors.ARROW)).not.toBe(null)
    }

    {
      const props = { ...Defaults, arrow: true }
      const popper = createPopperElement(1, props)
      updatePopperElement(popper, props, {
        ...Defaults,
        arrow: false,
      })
      expect(popper.querySelector(Selectors.ARROW)).toBe(null)
    }
  })

  it('sets new arrow element type', () => {
    {
      const popper = createPopperElement(1, Defaults)
      updatePopperElement(popper, Defaults, {
        ...Defaults,
        arrow: true,
        arrowType: 'round',
      })
      expect(popper.querySelector(Selectors.ARROW)).toBe(null)
      expect(popper.querySelector(Selectors.ROUND_ARROW)).not.toBe(null)
    }

    {
      const props = { ...Defaults, arrowType: 'round', arrow: true }
      const popper = createPopperElement(1, props)
      const newProps = { ...Defaults, arrowType: 'sharp', arrow: true }
      updatePopperElement(popper, props, newProps)
      expect(popper.querySelector(Selectors.ARROW)).not.toBe(null)
      expect(popper.querySelector(Selectors.ROUND_ARROW)).toBe(null)
      updatePopperElement(popper, newProps, Defaults)
      expect(popper.querySelector(Selectors.ARROW)).toBe(null)
      expect(popper.querySelector(Selectors.ROUND_ARROW)).toBe(null)
    }
  })

  it('sets interactive attribute', () => {
    const popper = createPopperElement(1, Defaults)
    const newProps = {
      ...Defaults,
      interactive: true,
    }
    updatePopperElement(popper, Defaults, newProps)
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
    const popper = createPopperElement(1, Defaults)
    const newProps = {
      ...Defaults,
      inertia: true,
    }
    updatePopperElement(popper, Defaults, newProps)
    expect(getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(true)
    updatePopperElement(popper, newProps, {
      ...newProps,
      inertia: false,
    })
    expect(getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(false)
  })

  it('sets new theme', () => {
    const popper = createPopperElement(1, Defaults)
    const newProps = {
      ...Defaults,
      theme: 'my custom themes',
    }
    updatePopperElement(popper, Defaults, newProps)
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

describe('afterPopperPositionUpdates', () => {
  it('is called by popper if not already updated', done => {
    const tip = tippy(h(), { lazy: false })
    // popper calls scheduleUpdate() on init
    const fn = jest.fn()
    afterPopperPositionUpdates(tip.popperInstance, fn)
    setTimeout(() => {
      expect(fn.mock.calls.length).toBe(1)
      done()
    }, 20)
  })

  it('is not called by popper if already updated', done => {
    const tip = tippy(h(), { lazy: false })
    const fn = jest.fn()
    // popper calls scheduleUpdate() on init
    setTimeout(() => {
      const fn = jest.fn()
      afterPopperPositionUpdates(tip.popperInstance, fn, true)
      setTimeout(() => {
        expect(fn.mock.calls.length).toBe(0)
        done()
      }, 20)
    }, 20)
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
    const popper = createPopperElement(1, Defaults)
    const children = getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.backdrop).toBeDefined()
  })

  it('returns the children of the popper element, with arrow', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: true })
    const children = getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.arrow).toBeDefined()
  })

  it('returns the children of the popper element, with round arrow', () => {
    const popper = createPopperElement(1, {
      ...Defaults,
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
    expect(arrow.matches(Selectors.ARROW)).toBe(true)
  })

  it('returns a round arrow if "round" is passed as argument', () => {
    const roundArrow = createArrowElement('round')
    expect(roundArrow.matches(Selectors.ROUND_ARROW)).toBe(true)
  })
})

describe('createBackdropElement', () => {
  it('returns a backdrop element', () => {
    const arrow = createBackdropElement()
    expect(arrow.matches(Selectors.BACKDROP)).toBe(true)
    expect(arrow.getAttribute('data-state')).toBe('hidden')
  })
})

describe('setVisibilityState', () => {
  it('sets the `data-state` attribute on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()]
    setVisibilityState(els, 'visible')
    expect(els[0].getAttribute('data-state')).toBe('visible')
    expect(els[1].getAttribute('data-state')).toBe('visible')
    expect(els[3].getAttribute('data-state')).toBe('visible')
    setVisibilityState(els, 'hidden')
    expect(els[0].getAttribute('data-state')).toBe('hidden')
    expect(els[1].getAttribute('data-state')).toBe('hidden')
    expect(els[3].getAttribute('data-state')).toBe('hidden')
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

describe('applyTransitionDuration', () => {
  it('sets the `transition-duration` property on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()]
    applyTransitionDuration(els, 1298)
    expect(els[0].style.transitionDuration).toBe('1298ms')
    expect(els[1].style.transitionDuration).toBe('1298ms')
    expect(els[3].style.transitionDuration).toBe('1298ms')
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
  const DISTANCE_IN_CSS = 10

  it('returns 0px by default', () => {
    expect(getOffsetDistanceInPx(Defaults.distance, DISTANCE_IN_CSS)).toBe(
      '0px',
    )
  })

  it('returns -10px if the distance is 20', () => {
    expect(getOffsetDistanceInPx(20, DISTANCE_IN_CSS)).toBe('-10px')
  })

  it('returns 5px if the distance is 5', () => {
    expect(getOffsetDistanceInPx(5, DISTANCE_IN_CSS)).toBe('5px')
  })

  it('returns 18px if the distance is -8', () => {
    expect(getOffsetDistanceInPx(-8, DISTANCE_IN_CSS)).toBe('18px')
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
      expect(getPopperPlacement(popper).endsWith('-start')).toBe(false)
      expect(getPopperPlacement(popper).endsWith('-end')).toBe(false)
    })
  })

  it('returns an empty string if there is no placement', () => {
    const popper = h('div')
    expect(getPopperPlacement(popper)).toBe('')
  })
})

describe('div', () => {
  it('creates and returns a div element', () => {
    const d = div()
    expect(d.nodeName).toBe('DIV')
  })
})
