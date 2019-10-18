import {hideAll, createTippyWithPlugins} from '../src';
import {createCreateSingletonWithPlugins} from '../src/addons/createSingleton';
import {createDelegateWithPlugins} from '../src/addons/delegate';
import animateFill from '../src/plugins/animateFill';
import followCursor from '../src/plugins/followCursor';
import inlinePositioning from '../src/plugins/inlinePositioning';
import sticky from '../src/plugins/sticky';
import {ROUND_ARROW} from '../src/constants';

const plugins = [animateFill, followCursor, inlinePositioning, sticky];
const extendedTippy = createTippyWithPlugins(plugins);

extendedTippy.createSingleton = createCreateSingletonWithPlugins(plugins);
extendedTippy.delegate = createDelegateWithPlugins(plugins);
extendedTippy.hideAll = hideAll;
extendedTippy.roundArrow = ROUND_ARROW;

export default extendedTippy;
