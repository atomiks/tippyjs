import getCorePlacement from '../utils/getCorePlacement'
import getOffsetDistanceInPx from '../utils/getOffsetDistanceInPx'

/**
* Creates a popper element then returns it
* @param {Number} id - the popper id
* @param {String} title - the tooltip's `title` attribute
* @param {Object} settings - individual settings
* @return {Element} - the popper element
*/
export default function createPopperElement(id, title, settings) {
  const {
    position,
    distance,
    arrow,
    animateFill,
    inertia,
    animation,
    arrowSize,
    size,
    theme,
    html,
    zIndex,
    interactive
  } = settings

  const popper = document.createElement('div')
  popper.setAttribute('class', 'tippy-popper')
  popper.setAttribute('role', 'tooltip')
  popper.setAttribute('aria-hidden', 'true')
  popper.setAttribute('id', `tippy-tooltip-${id}`)
  popper.style.zIndex = zIndex

  const tooltip = document.createElement('div')
  tooltip.setAttribute('class', `tippy-tooltip tippy-tooltip--${size} leave`)
  tooltip.setAttribute('data-animation', animation)

  theme.split(' ').forEach(t => {
    tooltip.classList.add(t +'-theme')
  })

  if (arrow) {
    // Add an arrow
    const arrow = document.createElement('div')
    arrow.setAttribute('class', `arrow-${arrowSize}`)
    arrow.setAttribute('x-arrow', '')
    tooltip.appendChild(arrow)
  }

  if (animateFill) {
    // Create animateFill circle element for animation
    tooltip.setAttribute('data-animatefill', '')
    const circle = document.createElement('div')
    circle.setAttribute('class', 'leave')
    circle.setAttribute('x-circle', '')
    tooltip.appendChild(circle)
  }

  if (inertia) {
    // Change transition timing function cubic bezier
    tooltip.setAttribute('data-inertia', '')
  }

  if (interactive) {
    tooltip.setAttribute('data-interactive', '')
  }

  // Tooltip content (text or HTML)
  const content = document.createElement('div')
  content.setAttribute('class', 'tippy-tooltip-content')

  if (html) {
    let templateId

    if (html instanceof Element) {
      content.appendChild(html)
      templateId = '#' + html.id || 'tippy-html-template'
    } else {
      content.innerHTML = document.getElementById(html.replace('#', '')).innerHTML
      templateId = html
    }

    popper.classList.add('html-template')
    interactive && popper.setAttribute('tabindex', '-1')
    tooltip.setAttribute('data-template-id', templateId)

  } else {
    content.innerHTML = title
  }

  // Init distance. Further updates are made in the popper instance's `onUpdate()` method
  tooltip.style[getCorePlacement(position)] = getOffsetDistanceInPx(distance)

  tooltip.appendChild(content)
  popper.appendChild(tooltip)

  return popper
}
