import getIndividualOptions     from './getIndividualOptions'
import createPopperElement      from './createPopperElement'
import createTrigger            from './createTrigger'
import getEventListeners        from './getEventListeners'
import evaluateOptions          from './evaluateOptions'

import removeTitle from '../utils/removeTitle'

let idCounter = 1

/**
* Creates tooltips for all el elements that match the instance's selector
* @param {Element[]} els
* @return {Object[]} Array of ref data objects
*/
export default function createTooltips(els) {
  return els.reduce((acc, reference) => {
    const id = idCounter

    const options = evaluateOptions(
      this.options.performance
        ? this.options
        : getIndividualOptions(reference, this.options)
    )

    const { html, trigger, touchHold } = options

    const title = reference.getAttribute('title')
    if (!title && !html) return acc

    reference.setAttribute('x-tooltipped', '')
    reference.setAttribute('aria-describedby', `tippy-tooltip-${id}`)

    removeTitle(reference)

    const popper = createPopperElement(id, title, options)
    const handlers = getEventListeners.call(this, reference, popper, options)
    let listeners = []

    trigger.trim().split(' ').forEach(event =>
        listeners = listeners.concat(
          createTrigger(event, reference, handlers, touchHold)
        )
    )

    acc.push({
      id,
      reference,
      popper,
      options,
      listeners,
      tippyInstance: this
    })

    // Add _tippy instance to reference element. Allows easy access to
    // methods when the instance only has one tooltip
    reference._tippy = this

    // Allow easy access to the popper's reference element
    popper._reference = reference

    idCounter++

    return acc
  }, [])
}
