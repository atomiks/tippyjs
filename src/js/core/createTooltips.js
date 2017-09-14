import getIndividualOptions    from './getIndividualOptions'
import createPopperElement      from './createPopperElement'
import createTrigger            from './createTrigger'
import getEventListenerHandlers from './getEventListenerHandlers'
import evaluateOptions         from './evaluateOptions'

import removeTitle from '../utils/removeTitle'

import { Store } from './globals'

let idCounter = 1

/**
* Creates tooltips for all el elements that match the instance's selector
* @param {Element[]} els
* @return {Object[]} Array of ref data objects
*/
export default function createTooltips(els) {
  return els.reduce((a, el) => {
    const id = idCounter

    const options = evaluateOptions(
      this.options.performance
        ? this.options
        : getIndividualOptions(el, this.options)
    )

    const { html, trigger, touchHold } = options

    const title = el.getAttribute('title')
    if (!title && !html) return a

    el.setAttribute('data-tooltipped', '')
    el.setAttribute('aria-describedby', `tippy-tooltip-${id}`)
    removeTitle(el)

    const popper = createPopperElement(id, title, options)
    const handlers = getEventListenerHandlers.call(this, el, popper, options)

    let listeners = []

    trigger.trim().split(' ').forEach(event =>
      listeners = listeners.concat(createTrigger(event, el, handlers, touchHold))
    )

    a.push({
      id,
      el,
      popper,
      options,
      listeners,
      tippyInstance: this
    })

    idCounter++

    return a
  }, [])
}
