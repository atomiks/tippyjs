import {currentInput} from '../bindGlobalEventListeners';
import {Plugin} from '../types';

interface Touch extends Plugin {
  name: 'touch';
  defaultValue: true;
}

const touch: Touch = {
  name: 'touch',
  defaultValue: true,
  fn(instance) {
    return {
      onShow() {
        if (currentInput.isTouch && !instance.props.touch) {
          return false;
        }
      },
    };
  },
};

export default touch;
