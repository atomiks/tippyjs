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
  distance: 40,
  flipOnUpdate: true,
  flipBehavior: ['right', 'bottom'],
  onMount() {
    window.addEventListener('resize', onResize)

    // Set the original dimensions before the image was expanded
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

    const elements = [tooltip, content, arrow]
    elements.forEach(element => {
      if (element) {
        element.style.transform = ''
      }
    })
  },
  popperOptions: {
    onCreate(data) {
      prevOffsets = currentOffsets = parseTranslate3d(data.styles.transform)
    },
    onUpdate(data) {
      wasInterrupted = true
      prevOffsets = currentOffsets

      // `react-flip-toolkit` adds this
      if (arrow) {
        arrow.style.transformOrigin = ''
      }

      // We need to parse it because Popper rounds the values but doesn't
      // expose the rounded values for us...
      const translate3d = parseTranslate3d(data.styles.transform)
      // Make sure `currentOffsets` runs after the `onSpringUpdate` tick
      requestAnimationFrame(() => {
        currentOffsets = translate3d
      })

      const { x, y } = tweenOffsets || prevOffsets

      // If update was scheduled due to resize. As far as I can tell, scrolling
      // doesn't cause much of an issue?
      if (isResizing) {
        tweenOffsets = translate3d
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
// Very first transition is jerky otherwise.
content.style.willChange = 'transform'

const elements = [tooltip, content, arrow]
elements.forEach(element => {
  if (element) {
    element.style.transitionProperty = 'visibility, opacity, top, left'
  }
})

const flipper = new ReactFlipToolkitCore({ element: instance.popper })

let prevOffsets
let currentOffsets
let tweenOffsets
let wasInterrupted

flipper.addFlipped({
  element: tooltip,
  flipId: 'tootlip',
  spring: 'veryGentle',
  // We need to ensure the popper's translation animation is in concert with the
  // dimensions spring animation so it stays perfectly positioned throughout
  onSpringUpdate(value) {
    if (wasInterrupted && tweenOffsets) {
      prevOffsets = tweenOffsets
      wasInterrupted = false
    }

    const { x: prevX, y: prevY } = prevOffsets
    const { x: currentX, y: currentY } = currentOffsets

    const x = prevX - value * (prevX - currentX)
    const y = prevY - value * (prevY - currentY)

    tweenOffsets = { x, y }

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
