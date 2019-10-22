import css from '../dist/tippy.css';
import {injectCSS} from '../src/css';
import {isBrowser} from '../src/browser';
import tippy, {hideAll} from '../src';
import createSingleton from '../src/addons/createSingleton';
import delegate from '../src/addons/delegate';
import animateFill from '../src/plugins/animateFill';
import followCursor from '../src/plugins/followCursor';
import inlinePositioning from '../src/plugins/inlinePositioning';
import sticky from '../src/plugins/sticky';
import {ROUND_ARROW} from '../src/constants';

if (isBrowser) {
  injectCSS(css);
}

tippy.setDefaultProps({
  plugins: [animateFill, followCursor, inlinePositioning, sticky],
});

tippy.createSingleton = createSingleton;
tippy.delegate = delegate;
tippy.hideAll = hideAll;
tippy.roundArrow = ROUND_ARROW;

export default tippy;
