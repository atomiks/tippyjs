import {Plugin} from '../types';

interface Interactive extends Plugin {
  name: 'interactive';
  defaultValue: false;
}

const interactive: Interactive = {
  name: 'interactive',
  defaultValue: false,
  fn(instance) {
    return {};
  },
};

export default interactive;
