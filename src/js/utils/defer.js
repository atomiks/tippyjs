/**
* Waits until next repaint to execute a fn
* @return {Function}
*/
export default function defer(fn) {
  window.requestAnimationFrame(() => {
    setTimeout(fn, 0)
  })
}
