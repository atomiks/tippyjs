import createPopperElement from '../utils/createPopperElement'
import createTrigger from '../utils/createTrigger'
import getIndividualOptions from '../utils/getIndividualOptions'
import evaluateOptions from '../utils/evaluateOptions'
import getInnerElements from '../utils/getInnerElements'
import removeTitle from '../utils/removeTitle'

import { defaults, browser } from './globals'

import { Tippy, _getEventListeners, _createPopperInstance, _addMutationObserver } from './Tippy'

let idCounter = 1

/**
 * Creates tooltips for each reference element
 * @param {Element[]} els
 * @param {Object} config
 * @return {Tippy[]} Array of Tippy instances
 */
export default function createTooltips(els, config) {
  return els.reduce((acc, reference) => {
    const id = idCounter

    const options = evaluateOptions(
      reference,
      config.performance ? config : getIndividualOptions(reference, config)
    )

    const { html, trigger, touchHold, dynamicTitle, createPopperInstanceOnInit } = options

    const title = reference.getAttribute('title')
    if (!title && !html) return acc

    reference.setAttribute('data-tippy', '')
    reference.setAttribute('aria-describedby', `tippy-${id}`)

    removeTitle(reference)

    const popper = createPopperElement(id, title, options)

    const tippy = new Tippy({
      id,
      reference,
      popper,
      options,
    })

    tippy.popperInstance = createPopperInstanceOnInit ? _createPopperInstance.call(tippy) : null

    const listeners = _getEventListeners.call(tippy)
    tippy.listeners = trigger
      .trim()
      .split(' ')
      .reduce((acc, eventType) => {
        return acc.concat(createTrigger(eventType, reference, listeners, touchHold))
      }, [])

    // Update tooltip content whenever the title attribute on the reference changes
    if (dynamicTitle) {
      _addMutationObserver.call(tippy, {
        target: reference,
        callback() {
          const { content } = getInnerElements(popper)
          const title = reference.getAttribute('title')
          if (title) {
            content.innerHTML = title
            removeTitle(reference)
          }
        },
        options: {
          attributes: true,
        },
      })
    }

    // Shortcuts
    reference._tippy = tippy
    popper._reference = reference

    acc.push(tippy)

    idCounter++

    return acc
  }, [])
}
