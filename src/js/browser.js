export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

const nav = isBrowser ? navigator : {}
const win = isBrowser ? window : {}

let Defaults = {
  isIE: /MSIE |Trident\//.test(nav.userAgent),
  isIOS: /iPhone|iPad|iPod/.test(nav.platform) && !win.MSStream,
  isSupported: 'MutationObserver' in win,
  supportsTouch: 'ontouchstart' in win,
  isUsingTouch: false,
  userInputDetectionEnabled: true,
  onUserInputChange: () => {}
}

export const setDefaults = partialDefaults => {
  Defaults = { ...Defaults, ...partialDefaults }
}

export default Defaults
