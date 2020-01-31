export function injectCSS(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-__NAMESPACE_PREFIX__-stylesheet', '');
  const head = document.head;
  const firstStyleOrLinkTag = document.querySelector('head>style,head>link');

  if (firstStyleOrLinkTag) {
    head.insertBefore(style, firstStyleOrLinkTag);
  } else {
    head.appendChild(style);
  }
}
