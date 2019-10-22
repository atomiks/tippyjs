import {
  onDocumentMouseMove,
  onDocumentTouchStart,
} from '../src/bindGlobalEventListeners';
import tippy from '../src';

export const IDENTIFIER = '__tippy';

export const MOUSEENTER = new MouseEvent('mouseenter', {bubbles: true});
export const MOUSELEAVE = new MouseEvent('mouseleave', {bubbles: true});
export const MOUSEDOWN = new MouseEvent('mousedown', {bubbles: true});
export const CLICK = new MouseEvent('click', {bubbles: true});
export const FOCUS = new FocusEvent('focus');
export const BLUR = new FocusEvent('blur');
export const TOUCHSTART = new TouchEvent('touchstart', {bubbles: true});
export const TOUCHEND = new TouchEvent('touchend', {bubbles: true});

export function cleanDocumentBody() {
  document.body.innerHTML = '';
}

export function setTestDefaultProps(props) {
  tippy.setDefaultProps({duration: 0, delay: 0, ...props});
}

export function h(nodeName = 'button', attributes = {}) {
  const el = document.createElement(nodeName);
  el.className = IDENTIFIER;

  for (const attr in attributes) {
    el.setAttribute(attr, attributes[attr]);
  }

  document.body.appendChild(el);

  return el;
}

export const withTestProps = props => ({
  lazy: false,
  content: 'content',
  ...props,
});

export function enableTouchEnvironment() {
  window.ontouchstart = true;
  onDocumentTouchStart();
}

export function disableTouchEnvironment() {
  delete window.ontouchstart;
  onDocumentMouseMove();
  onDocumentMouseMove();
}
