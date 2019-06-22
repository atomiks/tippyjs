import tippyBase from '../../src'
import '../../src/scss/index.scss'
import enhance from '../../src/extra-props/enhance'
import followCursor from '../../src/extra-props/followCursor'

const tippy = enhance(tippyBase, [followCursor])

tippy('.followCursor', {
  content: 'tooltip',
  animation: 'fade',
  animateFill: false,
  followCursor: true,
})
