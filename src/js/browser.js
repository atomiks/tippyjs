export const isBrowser = typeof window !== 'undefined'
export const isIE = isBrowser && /MSIE |Trident\//.test(navigator.userAgent)
export const isIOS =
  isBrowser && /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream
