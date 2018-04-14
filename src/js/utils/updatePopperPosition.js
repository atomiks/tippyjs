import reflow from './reflow'

/**
 * Wrapper util for popper position updating.
 * Updates the popper's position and invokes the callback on update.
 * Hackish workaround until Popper 2.0's update() becomes sync.
 * @param {Popper} popperInstance
 * @param {Function} callback: to run once popper's position was updated
 * @param {Boolean} updateAlreadyCalled: was scheduleUpdate() already called?
 */
export default function updatePopperPosition(
  popperInstance,
  callback,
  updateAlreadyCalled
) {
  const { popper, options } = popperInstance
  const onCreate = options.onCreate
  const onUpdate = options.onUpdate

  options.onCreate = options.onUpdate = () => {
    reflow(popper), callback && callback(), onUpdate()
    options.onCreate = onCreate
    options.onUpdate = onUpdate
  }

  if (!updateAlreadyCalled) {
    popperInstance.scheduleUpdate()
  }
}
