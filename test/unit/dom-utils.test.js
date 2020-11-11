import {h, IDENTIFIER} from '../utils';

import * as DomUtils from '../../src/dom-utils';
import tippy from '../../src';

describe('getArrayOfElements', () => {
  it('returns an empty array with no arguments', () => {
    expect(Array.isArray(DomUtils.getArrayOfElements())).toBe(true);
  });

  it('returns the same array if given an array', () => {
    const arr = [];
    expect(DomUtils.getArrayOfElements(arr)).toBe(arr);
  });

  it('returns an array of elements when given a valid selector string', () => {
    [...Array(10)].map(() => h());
    const allAreElements = DomUtils.getArrayOfElements(IDENTIFIER).every(
      (value) => value instanceof Element
    );
    expect(allAreElements).toBe(true);
  });

  it('returns an empty array when given an invalid selector string', () => {
    const arr = DomUtils.getArrayOfElements('😎');

    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(0);
  });

  it('returns an array of length 1 if the value is a DOM element', () => {
    const ref = h();
    const arr = DomUtils.getArrayOfElements(ref);

    expect(arr[0]).toBe(ref);
    expect(arr.length).toBe(1);
  });

  it('returns an array if given a NodeList', () => {
    const ref = h();
    const arr = DomUtils.getArrayOfElements(
      document.querySelectorAll(`.${IDENTIFIER}`)
    );

    expect(arr[0]).toBe(ref);
    expect(Array.isArray(arr)).toBe(true);
  });
});

describe('div', () => {
  it('creates and returns a div element', () => {
    const d = DomUtils.div();
    expect(d.nodeName).toBe('DIV');
  });
});

describe('setTransitionDuration', () => {
  it('sets the `transition-duration` property on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()];
    DomUtils.setTransitionDuration(els, 1298);

    expect(els[0].style.transitionDuration).toBe('1298ms');
    expect(els[1].style.transitionDuration).toBe('1298ms');
    expect(els[3].style.transitionDuration).toBe('1298ms');
  });
});

describe('setVisibilityState', () => {
  it('sets the `data-state` attribute on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()];

    DomUtils.setVisibilityState(els, 'visible');

    expect(els[0].getAttribute('data-state')).toBe('visible');
    expect(els[1].getAttribute('data-state')).toBe('visible');
    expect(els[3].getAttribute('data-state')).toBe('visible');

    DomUtils.setVisibilityState(els, 'hidden');

    expect(els[0].getAttribute('data-state')).toBe('hidden');
    expect(els[1].getAttribute('data-state')).toBe('hidden');
    expect(els[3].getAttribute('data-state')).toBe('hidden');
  });
});

describe('isReferenceElement', () => {
  it('correctly determines if a value is a reference element', () => {
    const instance = tippy(h());

    expect(DomUtils.isReferenceElement(document.createElement('div'))).toBe(
      false
    );
    expect(DomUtils.isReferenceElement(instance.reference)).toBe(true);
    expect(DomUtils.isReferenceElement(instance.popper)).toBe(false);

    instance.popper.classList.add('other');

    expect(DomUtils.isReferenceElement(instance.popper)).toBe(false);
  });
});

describe('getOwnerDocument', () => {
  it('finds the ownerDocument of an element', () => {
    expect(DomUtils.getOwnerDocument(document.createElement('div'))).toBe(document);
  });

  it('uses the default document if the element was created from a template', () => {
    const template = document.createElement('template');

    template.innerHTML = '<div></div>';

    const div = template.content.firstChild;

    expect(DomUtils.getOwnerDocument(div)).toBe(document);
  });
});
