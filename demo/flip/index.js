import Flipper from 'react-flip-toolkit/core'
import tippy from '../../src'
import '../../src/scss/index.scss'

const container = document.querySelector('.container')

const button = document.createElement('button')
button.style.transform = 'translate(100px, 300px)'
button.textContent = 'Reference'
container.appendChild(button)

const tippyContent = document.createElement('div')
const btn = document.createElement('button')
const wrapper = document.createElement('div')
const img = document.createElement('img')

tippyContent.appendChild(btn)
tippyContent.appendChild(wrapper)

img.src =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60'
img.style.width = '300px'
img.style.display = 'block'
img.style.transform = 'scale(1.1)'
img.style.marginTop = '20px'

wrapper.appendChild(img)
wrapper.style.display = 'none'
btn.textContent = 'Open image'

let flipper = null
let originalDimensions = null
let isExpanded = false
let wasInterrupted = false
let wasManuallyUpdated = false
const offsets = { prev: undefined, current: undefined, tween: undefined }
const distance = { prev: undefined, current: undefined, tween: undefined }

btn.onclick = () => {
  isExpanded = !isExpanded

  flipper.recordBeforeUpdate()

  Object.keys(instance.popperChildren).forEach(key => {
    if (instance.popperChildren[key]) {
      instance.popperChildren[key].style.transitionDuration = '0ms'
    }
  })

  const { tooltip } = instance.popperChildren
  tooltip.style.width = isExpanded ? '' : `${originalDimensions.width}px`
  tooltip.style.height = isExpanded ? '' : `${originalDimensions.height}px`

  wasManuallyUpdated = true

  instance.popperInstance.update()
  flipper.onUpdate()
}

function parseTranslate3d(string) {
  const match = string.match(/translate3d\((.+?),\s*(.+?),/)
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
}

const instance = tippy(button, {
  content: tippyContent,
  interactive: true,
  animation: 'fade',
  trigger: 'click',
  flipOnUpdate: true,
  arrow: false,
  onCreate(instance) {
    const { popper } = instance
    const { tooltip, content, arrow } = instance.popperChildren

    // Very first transition is jerky otherwise.
    content.style.willChange = 'transform'
    tooltip.style.textAlign = 'left'

    flipper = new Flipper({ element: popper })

    flipper.addFlipped({
      element: tooltip,
      flipId: 'tooltip',
      spring: 'veryGentle',
      onStart() {
        instance.disable()
      },
      onComplete() {
        instance.enable()
        wasManuallyUpdated = false
      },
      // We need to ensure the popper's translation animation is in concert with
      // the dimensions spring animation so it stays perfectly positioned
      // throughout
      onSpringUpdate(springValue) {
        if (wasInterrupted) {
          // Since the FLIP animation was interrupted, the popper's translation
          // begins at the tweened offset
          offsets.prev = offsets.tween
          wasInterrupted = false
        }

        const { x: prevX, y: prevY } = offsets.prev
        const { x: currentX, y: currentY } = offsets.current
        const { property: prevProperty, value: prevDistance } = distance.prev
        const {
          property: currentProperty,
          value: currentDistance,
        } = distance.current

        // Calculate tweened offset and distance
        const tweenedX = prevX - springValue * (prevX - currentX)
        const tweenedY = prevY - springValue * (prevY - currentY)
        const tweenedDistance =
          prevDistance -
          Math.max(0, Math.min(springValue, 1)) *
            (prevDistance - currentDistance)

        // Write the current tweened offsets due to the FLIP animation
        offsets.tween = { x: tweenedX, y: tweenedY }
        distance.tween = {
          property: currentProperty,
          value: tweenedDistance,
        }

        // Set tweened transform
        const tweenedTransform = `translate3d(${tweenedX}px, ${tweenedY}px, 0)`
        instance.popper.style.transform = tweenedTransform

        // Set tweened distance
        const { tooltip } = instance.popperChildren
        tooltip.style[prevProperty] = '0'
        tooltip.style[currentProperty] = `${tweenedDistance}px`
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
  },
  onMount() {
    const { tooltip } = instance.popperChildren

    if (!originalDimensions) {
      originalDimensions = {
        width: tooltip.offsetWidth,
        height: tooltip.offsetHeight,
      }
      tooltip.style.width = `${originalDimensions.width}px`
      tooltip.style.height = `${originalDimensions.height}px`
      wrapper.style.display = 'block'
    }
  },
  popperOptions: {
    onCreate(data) {
      const currentOffsets = parseTranslate3d(data.styles.transform)
      offsets.current = currentOffsets
      offsets.prev = currentOffsets

      const { tooltip } = instance.popperChildren
      const property = tooltip.style.top ? 'top' : 'left'
      const value = parseFloat(tooltip.style[property])

      distance.prev = { property, value }
      distance.current = { property, value }
    },
    onUpdate(data) {
      const { tooltip, arrow } = instance.popperChildren

      // `react-flip-toolkit` adds this
      if (arrow) {
        arrow.style.transformOrigin = ''
      }

      wasInterrupted = true
      offsets.prev = offsets.current
      distance.prev = distance.current

      // We need to parse it because Popper rounds the values but doesn't expose
      // the rounded values for us...
      const currentOffsets = parseTranslate3d(data.styles.transform)
      const currentProperty = tooltip.style.top ? 'top' : 'left'
      const currentValue = parseFloat(tooltip.style[currentProperty])

      offsets.current = currentOffsets
      distance.current = {
        property: currentProperty,
        value: currentValue,
      }

      // Runs AFTER first `onSpringUpdate` frame
      requestAnimationFrame(() => {
        offsets.tween = currentOffsets
      })

      // onSpringUpdate and popper's .update() run in different frames, leading to
      // 1 frame glitch
      if (wasManuallyUpdated) {
        const { x, y } = offsets.tween || offsets.prev
        const { property, value } = distance.tween || distance.prev
        instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`
        tooltip.style[property] = `${value}px`
      }
    },
  },
})
