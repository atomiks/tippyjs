import getIndividualOptions from './getIndividualOptions'
import createPopperElement  from './createPopperElement'
import createTrigger        from './createTrigger'
import getEventListeners    from './getEventListeners'
import evaluateOptions      from './evaluateOptions'

import removeTitle      from '../utils/removeTitle'
import getInnerElements from '../utils/getInnerElements'

let idCounter = 1

/**
* Creates tooltips for all el elements that match the instance's selector
* @param {Element[]} els
* @return {Object[]} Array of ref data objects
*/
export default function createTooltips(els) {
  return els.reduce((acc, reference) => {
    const id = idCounter

    const options = Object.assign({}, evaluateOptions(
      this.options.performance
        ? this.options
        : getIndividualOptions(reference, this.options)
    ))

    if (typeof options.html === 'function') {
      options.html = options.html(reference)
    }

    const {
      html,
      trigger,
      touchHold,
      dynamicTitle
    } = options

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

    // Shortcuts
    reference._tippy = this
    reference._popper = popper
    popper._reference = reference

    // Update tooltip content whenever the title attribute on the reference changes
    let observer

    if (dynamicTitle && window.MutationObserver) {
      const { content } = getInnerElements(popper)

      observer = new MutationObserver(() => {
        const title = reference.getAttribute('title')
        if (title) {
          content.innerHTML = title
          removeTitle(reference)
        }
      })

      observer.observe(reference, { attributes: true })
    }

    acc.push({
      id,
      reference,
      popper,
      options,
      listeners,
      tippyInstance: this,
      _mutationObservers: [observer]
    })

    idCounter++

    return acc
  }, [])
}
