import tippy from '../../src/index'
import '../../src/scss/index.scss'

tippy.setDefaults({
  content: 'test',
})

tippy('#sticky', {
  sticky: true,
  showOnInit: true,
  onMount(instance) {
    instance.reference.style.transition = 'all 15s'
    instance.reference.style.transform = 'translateX(1000px)'
  },
})

tippy('#sticky-duration', {
  sticky: true,
  showOnInit: true,
  updateDuration: 200,
  onMount(instance) {
    instance.reference.style.transition = 'all 15s'
    instance.reference.style.transform = 'translateX(1000px)'
  },
})

tippy('#delay-cursor-leave', {
  interactive: true,
  delay: 500,
})

tippy('#followCursor-true', {
  followCursor: true,
})

tippy('#followCursor-true-delay', {
  followCursor: true,
  delay: 200,
  duration: 0,
})

tippy('#followCursor-horizontal', {
  followCursor: 'horizontal',
})

tippy('#followCursor-vertical', {
  followCursor: 'vertical',
})

tippy('#followCursor-initial', {
  followCursor: 'initial',
})

tippy('#followCursor-initial-delay', {
  followCursor: 'initial',
  delay: 200,
})
