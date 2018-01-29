/**
 * Triggers document reflow.
 * Use void because some minifiers or engines think simply accessing the property
 * is unnecessary.
 * @param {Element} popper
 */
export default function reflow(popper) {
  void popper.offsetHeight
}
