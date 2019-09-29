import {hideAll, createTippyWithPlugins} from '../src';
import createSingleton from '../src/addons/createSingleton';
import delegate from '../src/addons/delegate';
import animateFill from '../src/plugins/animateFill';
import followCursor from '../src/plugins/followCursor';
import inlinePositioning from '../src/plugins/inlinePositioning';
import sticky from '../src/plugins/sticky';
import {ROUND_ARROW} from '../src/constants';

const extendedTippy = createTippyWithPlugins([
  animateFill,
  followCursor,
  inlinePositioning,
  sticky,
]);

extendedTippy.createSingleton = createSingleton;
extendedTippy.delegate = delegate;
extendedTippy.hideAll = hideAll;
extendedTippy.roundArrow = ROUND_ARROW;

export default extendedTippy;
