import prefix from './prefix'

/**
 * Creates a popper element then returns it
 * @param {Number} id - the popper id
 * @param {String} title - the tooltip's `title` attribute
 * @param {Object} options - individual options
 * @return {Element} - the popper element
 */
export default function createPopperElement(id, title, options) {
  const {
    arrow,
    arrowType,
    arrowTransform,
    animateFill,
    inertia,
    animation,
    size,
    theme,
    html,
    zIndex,
    interactive,
    maxWidth
  } = options

  const popper = document.createElement('div')
  popper.setAttribute('class', 'tippy-popper')
  popper.setAttribute('role', 'tooltip')
  popper.setAttribute('id', `tippy-${id}`)
  popper.style.zIndex = zIndex
  popper.style.maxWidth = maxWidth

  const tooltip = document.createElement('div')
  tooltip.setAttribute('class', 'tippy-tooltip')
  tooltip.setAttribute('data-size', size)
  tooltip.setAttribute('data-animation', animation)
  tooltip.setAttribute('data-state', 'hidden')

  theme.split(' ').forEach(t => {
    tooltip.classList.add(t + '-theme')
  })

  if (arrow) {
    const arrow = document.createElement('div')
    arrow.style[prefix('transform')] = arrowTransform
    
    if (arrowType === 'round') {
      arrow.classList.add('tippy-roundarrow')
      arrow.innerHTML = '<svg viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg"><path d="M1 8s4.577-.019 7.253-4.218c2.357-3.698 5.175-3.721 7.508 0C18.404 7.997 23 8 23 8H1z"/></svg>'
    } else {
      arrow.classList.add('tippy-arrow')
    }

    tooltip.appendChild(arrow)
  }

  if (animateFill) {
    // Create animateFill circle element for animation
    tooltip.setAttribute('data-animatefill', '')
    const circle = document.createElement('div')
    circle.setAttribute('data-state', 'hidden')
    circle.classList.add('tippy-backdrop')
    tooltip.appendChild(circle)
  }

  if (inertia) {
    // Change transition timing function cubic bezier
    tooltip.setAttribute('data-inertia', '')
  }

  if (interactive) {
    tooltip.setAttribute('data-interactive', '')
  }

  const content = document.createElement('div')
  content.setAttribute('class', 'tippy-content')

  if (html) {
    let templateId

    if (html instanceof Element) {
      content.appendChild(html)
      templateId = '#' + html.id || 'tippy-html-template'
    } else {
      content.innerHTML = document.querySelector(html).innerHTML
      templateId = html
    }

    popper.setAttribute('data-html', '')
    interactive && popper.setAttribute('tabindex', '-1')
    tooltip.setAttribute('data-template-id', templateId)
  } else {
    content.innerHTML = title
  }

  tooltip.appendChild(content)
  popper.appendChild(tooltip)

  return popper
}
