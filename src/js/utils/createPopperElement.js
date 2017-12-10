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
    placement,
    distance,
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
    maxWidth,
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
      arrow.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 64 20" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
        <g transform="matrix(1.04009,0,0,1.45139,-1.26297,-65.9145)">
          <path d="M1.214,59.185C1.214,59.185 12.868,59.992 21.5,51.55C29.887,43.347 33.898,43.308 42.5,51.55C51.352,60.031 62.747,59.185 62.747,59.185L1.214,59.185Z"/>
        </g>
      </svg>`
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
