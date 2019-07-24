import tippyBase from '../../src'
import '../../src/scss/index.scss'
import enhance from '../../src/extra-props/enhance'
import followCursor from '../../src/extra-props/followCursor'

const tippy = enhance(tippyBase, [followCursor])

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
