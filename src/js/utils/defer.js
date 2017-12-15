import { isLongerTimeoutBrowser } from '../core/globals'

/**
 * Waits until next repaint to execute a fn
 * NOTE: UC Browser / Samsung Internet need a longer timeout
 * @param {Function} fn
 */
export default function defer(fn) {
  requestAnimationFrame(() => {
    setTimeout(fn, isLongerTimeoutBrowser ? 60 : 0)
  })
}
