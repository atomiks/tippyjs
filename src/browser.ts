export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

const ua = isBrowser ? navigator.userAgent : ''

export const isIE = /MSIE |Trident\//.test(ua)
export const isUCBrowser = /UCBrowser\//.test(ua)
export const isIOS =
  isBrowser &&
  /iPhone|iPad|iPod/.test(navigator.platform) &&
  !(window as any).MSStream
