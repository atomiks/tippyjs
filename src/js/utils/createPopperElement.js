import prefix from './prefix'
import div from './div'

/**
 * Creates a popper element then returns it
 * @param {Number} id - the popper id
 * @param {String} title - the tooltip's `title` attribute
 * @param {Object} options - individual options
 * @return {Element} - the popper element
 */
export default function createPopperElement(id, title, options) {
  const popper = div()
  popper.setAttribute('class', 'tippy-popper')
  popper.setAttribute('role', 'tooltip')
  popper.setAttribute('id', `tippy-${id}`)
  popper.style.zIndex = options.zIndex
  popper.style.maxWidth = options.maxWidth

  const tooltip = div()
  tooltip.setAttribute('class', 'tippy-tooltip')
  tooltip.setAttribute('data-size', options.size)
  tooltip.setAttribute('data-animation', options.animation)
  tooltip.setAttribute('data-state', 'hidden')
  options.theme.split(' ').forEach(t => {
    tooltip.classList.add(t + '-theme')
  })

  const content = div()
  content.setAttribute('class', 'tippy-content')

  if (options.arrow) {
    const arrow = div()
    arrow.style[prefix('transform')] = options.arrowTransform

    if (options.arrowType === 'round') {
      arrow.classList.add('tippy-roundarrow')
      arrow.innerHTML =
        '<svg viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg"><path d="M3 8s2.021-.015 5.253-4.218C9.584 2.051 10.797 1.007 12 1c1.203-.007 2.416 1.035 3.761 2.782C19.012 8.005 21 8 21 8H3z"/></svg>'
    } else {
      arrow.classList.add('tippy-arrow')
    }

    tooltip.appendChild(arrow)
  }

  if (options.animateFill) {
    // Create animateFill circle element for animation
    tooltip.setAttribute('data-animatefill', '')
    const backdrop = div()
    backdrop.classList.add('tippy-backdrop')
    backdrop.setAttribute('data-state', 'hidden')
    tooltip.appendChild(backdrop)
  }

  if (options.inertia) {
    // Change transition timing function cubic bezier
    tooltip.setAttribute('data-inertia', '')
  }

  if (options.interactive) {
    tooltip.setAttribute('data-interactive', '')
  }

  const html = options.html
  if (html) {
    let templateId

    if (html instanceof Element) {
      content.appendChild(html)
      templateId = `#${html.id || 'tippy-html-template'}`
    } else {
      // trick linters: https://github.com/atomiks/tippyjs/issues/197
      content[true && 'innerHTML'] = document.querySelector(html)[
        true && 'innerHTML'
      ]
      templateId = html
    }

    popper.setAttribute('data-html', '')
    tooltip.setAttribute('data-template-id', templateId)

    if (options.interactive) {
      popper.setAttribute('tabindex', '-1')
    }
  } else {
    content[options.allowTitleHTML ? 'innerHTML' : 'textContent'] = title
  }

  tooltip.appendChild(content)
  popper.appendChild(tooltip)

  return popper
}
