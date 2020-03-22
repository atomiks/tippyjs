import {
  onDocumentMouseMove,
  onDocumentTouchStart,
} from '../src/bindGlobalEventListeners';
import tippy from '../src';

export const IDENTIFIER = '__tippy';

export function cleanDocumentBody() {
  document.body.innerHTML = '';
}

export function h(nodeName = 'button', attributes = {}, to = document.body) {
  const el = document.createElement(nodeName);
  el.className = IDENTIFIER;

  for (const attr in attributes) {
    el.setAttribute(attr, attributes[attr]);
  }

  to.appendChild(el);

  return el;
}

export function enableTouchEnvironment() {
  window.ontouchstart = true;
  onDocumentTouchStart();
}

export function disableTouchEnvironment() {
  delete window.ontouchstart;
  onDocumentMouseMove();
  onDocumentMouseMove();
}

export async function screenshotTest(page, name) {
  // Remove container border so the image is clean
  await page.addStyleTag({
    content: `
    * { 
      color: transparent; 
    }

    .container {
      border: none !important;
    }
    `,
  });

  const rect = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    const {x, y, width, height} = element.getBoundingClientRect();
    return {left: x, top: y, width, height, id: element.id};
  }, `#${name}`);

  return page.screenshot({
    path: null,
    clip: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    },
  });
}

export async function navigateToTest(page, name) {
  return page.$eval(`button[data-id="${name}"]`, (el) => el.click());
}
