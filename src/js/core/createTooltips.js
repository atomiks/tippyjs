import getIndividualSettings    from './getIndividualSettings'
import createPopperElement      from './createPopperElement'
import createTrigger            from './createTrigger'
import getEventListenerHandlers from './getEventListenerHandlers'

import removeTitle from '../utils/removeTitle'

import { Store } from './globals'

let idCounter = 1

/**
* Creates tooltips for all el elements that match the instance's selector
* @param {Array} els - Elements
*/
export default function createTooltips(els) {

    els.forEach(el => {

        const settings = this.settings.performance
                         ? this.settings
                         : getIndividualSettings(el, this.settings)

        // animateFill is disabled if an arrow is true
        if (settings.arrow) settings.animateFill = false

        const { html, trigger, touchHold } = settings

        const title = el.getAttribute('title')
        if (!title && !html) return

        const id = idCounter
        el.setAttribute('data-tooltipped', '')
        el.setAttribute('aria-describedby', `tippy-tooltip-${id}`)

        removeTitle(el)

        const popper = createPopperElement(id, title, settings)
        const handlers = getEventListenerHandlers.call(this, el, popper, settings)
        let listeners = []

        trigger.trim().split(' ').forEach(event =>
            listeners = listeners.concat(createTrigger(event, el, handlers, touchHold))
        )

        Store.push({
            id,
            el,
            popper,
            settings,
            listeners,
            tippyInstance: this
        })

        idCounter++
    })
}
