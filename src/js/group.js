export default function group(instances, { delay, duration = 0 }) {
  let isAnyTippyOpen = false

  instances.forEach(instance => {
    instance._originalProps = {
      duration: instance.props.duration,
      onHide: instance.props.onHide,
      onShow: instance.props.onShow,
      onShown: instance.props.onShown,
    }
  })

  function setIsAnyTippyOpen(value) {
    isAnyTippyOpen = value
    updateInstances()
  }

  function onShow(instance) {
    instance._originalProps.onShow(instance)
    instances.forEach(instance => {
      instance.set({ duration })
      instance.hide()
    })
    setIsAnyTippyOpen(true)
  }

  function onHide(instance) {
    instance._originalProps.onHide(instance)
    setIsAnyTippyOpen(false)
  }

  function onShown(instance) {
    instance._originalProps.onShown(instance)
    instance.set({ duration: instance._originalProps.duration })
  }

  function updateInstances() {
    instances.forEach(instance => {
      instance.set({
        onShow,
        onShown,
        onHide,
        delay: isAnyTippyOpen
          ? [0, Array.isArray(delay) ? delay[1] : delay]
          : delay,
        duration: isAnyTippyOpen ? duration : instance._originalProps.duration,
      })
    })
  }

  updateInstances()
}
