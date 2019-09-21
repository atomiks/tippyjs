import tippy from '../../src'
import '../../src/scss/index.scss'
import followCursor from '../../src/plugins/followCursor'
import sticky from '../../src/plugins/sticky'

tippy.use(followCursor)
tippy.use(sticky)

tippy('.followCursor', {
  content: 'tooltip',
  animation: 'fade',
  followCursor: true,
  distance: 20,
  arrow: false,
  delay: [100, 500],
  onCreate(instance) {
    setInterval(() => {
      instance.setContent(Math.random())
    }, 500)
  },
})

tippy('.sticky', {
  content: 'tooltip',
  sticky: true,
  showOnCreate: true,
})
