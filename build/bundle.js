import css from '../dist/tippy.css';
import tippy from '../src';
import {injectCSS} from '../src/css';
import {isBrowser} from '../src/browser';

if (isBrowser) {
  injectCSS(css);
}

export default tippy;
