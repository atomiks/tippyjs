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
    arrow: true,
  }
  tippy('.inline', { ...props, inlinePositioning: true })
  tippy('.cursorRect', { ...props, inlinePositioning: 'cursorRect' })
  tippy('.cursorPoint', { ...props, inlinePositioning: 'cursorPoint' })
})

tippy('.followCursor', {
  content: 'tooltip',
  animation: 'fade',
  animateFill: false,
  followCursor: true,
})
