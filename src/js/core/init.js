import bindEventListeners from './bindEventListeners'

/**
* To run a single time, once DOM is presumed to be ready
* @return {Boolean} whether the function has run or not
*/
export default function init() {
  if (init.done) return false
  init.done = true

  bindEventListeners()

  return true
}
