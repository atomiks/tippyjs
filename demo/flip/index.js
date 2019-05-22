import tippy from '../../src'
import '../../src/scss/index.scss'

const container = document.querySelector('.container')

const button = document.createElement('button')
button.style.transform = 'translate(100px, 300px)'
button.textContent = 'Reference'
container.append(button)

const tippyContent = document.createElement('div')
const btn = document.createElement('button')
const hidden = document.createElement('div')
const img = document.createElement('img')

tippyContent.append(btn)
tippyContent.append(hidden)

img.src =
  'https://images.unsplash.com/photo-1557939403-1760a0e47505?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1931&q=80'
img.style.width = '300px'
img.style.display = 'block'
img.style.transform = 'scale(1.1)'
img.style.marginTop = '20px'

hidden.appendChild(img)
hidden.style.display = 'none'
btn.textContent = 'Open image'

let isExpanded = false
let originalWidth, originalHeight

btn.onclick = () => {
  if (!instance.state.isEnabled) {
    return
  }

  flipper.recordBeforeUpdate()

  tooltip.style.transitionDuration = '0ms'
  content.style.transitionDuration = '0ms'
  if (arrow) {
    arrow.style.transitionDuration = '0ms'
  }

  isExpanded = !isExpanded

  tooltip.style.width = isExpanded ? '' : `${originalWidth}px`
  tooltip.style.height = isExpanded ? '' : `${originalHeight}px`

  instance.popperInstance.update()
  flipper.onUpdate()
}

function parseTranslate3d(string) {
  const match = string.match(/translate3d\((.+?),\s*(.+?),/)
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
}

const instance = tippy(button, {
  content: tippyContent,
  placement: 'right',
  interactive: true,
  animateFill: false,
  animation: 'fade',
  trigger: 'click',
  distance: 8,
  flipOnUpdate: true,
  theme: 'google',
  onMount() {
    window.addEventListener('resize', onResize)

    if (!originalWidth) {
      originalWidth = tooltip.offsetWidth
      originalHeight = tooltip.offsetHeight
      hidden.style.display = 'block'
      tooltip.style.width = `${originalWidth}px`
      tooltip.style.height = `${originalHeight}px`
    }
  },
  onHidden() {
    window.removeEventListener('resize', onResize)

    tooltip.style.transform = ''
    content.style.transform = ''
  },
  popperOptions: {
    onCreate(data) {
      prevTranslate3d = currentTranslate3d = parseTranslate3d(
        data.styles.transform,
      )
    },
    onUpdate(data) {
      wasInterrupted = true
      prevTranslate3d = currentTranslate3d

      if (arrow) {
        arrow.style.transformOrigin = ''
      }

      // We need to parse it because Popper rounds the values but doesn't
      // expose the rounded values for us...
      const translate3d = parseTranslate3d(data.styles.transform)
      requestAnimationFrame(() => {
        currentTranslate3d = translate3d
      })

      const { x, y } = isResizing
        ? translate3d
        : tweenTranslate3d || prevTranslate3d

      // If update was scheduled due to resize. As far as I can tell, scrolling
      // doesn't cause much of an issue?
      if (isResizing) {
        tweenTranslate3d = translate3d
      } else {
        // Safari needs it due to onSpringUpdate and popper's .update()
        // running in different ticks, leading to 1 frame glitch
        instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    },
  },
})

let isResizing = false
let resizeTimeout
function onResize() {
  isResizing = true
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    isResizing = false
  }, 100)
}

const { tooltip, content, arrow } = instance.popperChildren

tooltip.style.textAlign = 'left'
content.style.willChange = 'transform'

const flipper = new ReactFlipToolkitCore({
  element: instance.popper,
})

let prevTranslate3d
let currentTranslate3d
let tweenTranslate3d
let wasInterrupted

flipper.addFlipped({
  element: tooltip,
  flipId: 'tootlip',
  spring: 'veryGentle',
  onSpringUpdate(value) {
    if (wasInterrupted && tweenTranslate3d) {
      prevTranslate3d = tweenTranslate3d
      wasInterrupted = false
    }

    const { x: prevX, y: prevY } = prevTranslate3d
    const { x: currentX, y: currentY } = currentTranslate3d

    const x = prevX - value * (prevX - currentX)
    const y = prevY - value * (prevY - currentY)

    tweenTranslate3d = { x, y }

    instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`
  },
})

flipper.addInverted({
  element: content,
  parent: tooltip,
})

if (arrow) {
  flipper.addInverted({
    element: arrow,
    parent: tooltip,
  })
}
