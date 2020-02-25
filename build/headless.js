import tippy from '../src';

export {hideAll} from '../src';
export {default as createSingleton} from '../src/addons/createSingleton';
export {default as delegate} from '../src/addons/delegate';
export {default as animateFill} from '../src/plugins/animateFill';
export {default as followCursor} from '../src/plugins/followCursor';
export {default as inlinePositioning} from '../src/plugins/inlinePositioning';
export {default as sticky} from '../src/plugins/sticky';
export {ROUND_ARROW as roundArrow} from '../src/constants';

tippy.setDefaultProps({animation: false});

export default tippy;
