import tippy from '../src';
import {render} from '../src/template';

tippy.setDefaultProps({render});

export {default, hideAll} from '../src';
export {default as createSingleton} from '../src/addons/createSingleton';
export {default as delegate} from '../src/addons/delegate';
export {default as animateFill} from '../src/plugins/animateFill';
export {default as followCursor} from '../src/plugins/followCursor';
export {default as inlinePositioning} from '../src/plugins/inlinePositioning';
export {default as sticky} from '../src/plugins/sticky';
export {ROUND_ARROW as roundArrow} from '../src/constants';
