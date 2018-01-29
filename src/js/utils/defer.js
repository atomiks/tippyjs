/**
 * Waits until next repaint to execute a fn
 * @param {Function} fn
 */
export default function defer(fn) {
  requestAnimationFrame(() => {
    setTimeout(fn, 1)
  })
}
