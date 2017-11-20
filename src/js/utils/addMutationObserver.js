/**
* Adds a mutation observer to an element and stores it in the instance
* @param {Object}
*/
export default function addMutationObserver({ tippy, target, callback, options }) {
  if (!window.MutationObserver) return
  
  const observer = new MutationObserver(callback)
  observer.observe(target, options)
  tippy._mutationObservers.push(observer)
}
