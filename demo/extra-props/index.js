import tippyBase from '../../src'
import '../../src/scss/index.scss'
import enhance from '../../src/extra-props/enhance'
import followCursor from '../../src/extra-props/followCursor'
import inlinePositioning from '../../src/extra-props/inlinePositioning'

const tippy = enhance(tippyBase, [followCursor, inlinePositioning])

const placements = ['top', 'right', 'bottom', 'left']
placements.forEach(placement => {
  const props = {
    placement,
    multiple: true,
    content: 'tooltip',
    duration: 0,
  }
  tippy('.inline', { ...props, inlinePositioning: true })
  tippy('.cursor', { ...props, inlinePositioning: 'cursor' })
})

const instance = tippy('.followCursor', {
  content: 'tooltip',
  animation: 'fade',
  followCursor: true,
  distance: 20,
  arrow: false,
  delay: [100, 500],
})[0]

setInterval(() => {
  instance.setContent(Math.random())
}, 1000)
