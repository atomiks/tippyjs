export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

const ua = isBrowser ? navigator.userAgent : '';

export const isIE = /MSIE |Trident\//.test(ua);
