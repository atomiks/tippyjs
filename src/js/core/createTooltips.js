import getIndividualSettings    from './getIndividualSettings'
import createPopperElement      from './createPopperElement'
import createTrigger            from './createTrigger'
import getEventListenerHandlers from './getEventListenerHandlers'
import evaluateSettings         from './evaluateSettings'

import removeTitle      from '../utils/removeTitle'
import getInnerElements from '../utils/getInnerElements'

import { Store } from './globals'

let idCounter = 1

/**
* Creates tooltips for all el elements that match the instance's selector
* @param {Element[]} els
* @return {Object[]} Array of ref data objects
*/
export default function createTooltips(els) {
  return els.reduce((acc, el) => {
    const id = idCounter

    const settings = Object.assign({}, evaluateSettings(
      this.settings.performance
        ? this.settings
        : getIndividualSettings(el, this.settings)
    ))

    if (typeof settings.html === 'function') settings.html = settings.html(el)

    const {
      html,
      trigger,
      touchHold,
      dynamicTitle
    } = settings

    const title = el.getAttribute('title')
    if (!title && !html) return acc

    el.setAttribute('data-tooltipped', '')
    el.setAttribute('aria-describedby', `tippy-tooltip-${id}`)
    removeTitle(el)

    const popper = createPopperElement(id, title, settings)
    const handlers = getEventListenerHandlers.call(this, el, popper, settings)

    let listeners = []

    trigger.trim().split(' ').forEach(event =>
      listeners = listeners.concat(
        createTrigger(event, el, handlers, touchHold)
      )
    )

    // Add a mutation observer to observe the reference element for `title`
    // attribute changes, then automatically update tooltip content
    let observer

    if (dynamicTitle && window.MutationObserver) {
      const { content } = getInnerElements(popper)

      observer = new MutationObserver(() => {
        const title = el.getAttribute('title')
        if (title) {
          content.innerHTML = title
          removeTitle(el)
        }
      })

      observer.observe(el, { attributes: true })
    }

    acc.push({
      id,
      el,
      popper,
      settings,
      listeners,
      tippyInstance: this,
      _mutationObservers: [observer]
    })

    idCounter++

    return acc
  }, [])
}
