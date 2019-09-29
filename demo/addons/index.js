import tippy from '../../src';
import '../../src/scss/index.scss';
import createSingleton from '../../src/addons/createSingleton';
import delegate from '../../src/addons/delegate';

delegate('#delegate', {target: 'button'});

const instances = tippy('.createSingleton', {content: () => Math.random()});
createSingleton(instances, {delay: 500, updateDuration: 300});
