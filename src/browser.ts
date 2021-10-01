export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

export const isIE11 = isBrowser
  ? // @ts-ignore
    !!window.msCrypto
  : false;
