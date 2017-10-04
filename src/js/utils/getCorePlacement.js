/**
* Returns the non-shifted placement (e.g., 'bottom-start' => 'bottom')
* @param {String} placement
* @return {String}
*/
export default function getCorePlacement(placement) {
  return placement.replace(/-.+/, '')
}
