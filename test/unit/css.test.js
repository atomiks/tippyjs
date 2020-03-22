import {injectCSS} from '../../src/css';

afterEach(() => {
  document.head.innerHTML = '';
});

describe('injectCSS', () => {
  const styles = 'body { color: red; }';

  it('injects a string of css styles into the document `head`', () => {
    expect(document.head.querySelector('style')).toBe(null);

    injectCSS(styles);

    const stylesheet = document.head.querySelector(
      '[data-__NAMESPACE_PREFIX__-stylesheet]'
    );

    expect(stylesheet).not.toBe(null);
    expect(stylesheet.textContent).toBe(styles);
  });

  it('places the node before the first style or link node (link before style)', () => {
    document.head.append(document.createElement('title'));
    document.head.append(document.createElement('link'));
    document.head.append(document.createElement('style'));

    injectCSS(styles);

    const stylesheet = document.head.querySelector(
      '[data-__NAMESPACE_PREFIX__-stylesheet]'
    );

    expect(document.head.children[1]).toBe(stylesheet);
  });

  it('places the node before the first style or link node (link after style)', () => {
    document.head.append(document.createElement('title'));
    document.head.append(document.createElement('style'));
    document.head.append(document.createElement('link'));

    injectCSS(styles);

    const stylesheet = document.head.querySelector(
      '[data-__NAMESPACE_PREFIX__-stylesheet]'
    );

    expect(document.head.children[1]).toBe(stylesheet);
  });
});
