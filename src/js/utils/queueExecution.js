/**
* Waits until next repaint to execute a fn
* @return {Function}
*/
export default function queueExecution(fn) {
  window.requestAnimationFrame(() => {
    setTimeout(fn, 0)
  })
}
