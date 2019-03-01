export const isBrowser = typeof window !== 'undefined'

const ua = isBrowser && navigator.userAgent

export const isIE = /MSIE |Trident\//.test(ua)
export const isUCBrowser = /UCBrowser\//.test(ua)
export const isIOS =
  // @ts-ignore
  isBrowser && /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream
