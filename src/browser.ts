import {currentInput} from './bindGlobalEventListeners';
import {IOS_CLASS} from './constants';

export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

const ua = isBrowser ? navigator.userAgent : '';

export const isIE = /MSIE |Trident\//.test(ua);
export const isUCBrowser = /UCBrowser\//.test(ua);
export const isIOS = isBrowser && /iPhone|iPad|iPod/.test(navigator.platform);

export function updateIOSClass(isAdd: boolean): void {
  const shouldAdd = isAdd && isIOS && currentInput.isTouch;
  document.body.classList[shouldAdd ? 'add' : 'remove'](IOS_CLASS);
}
