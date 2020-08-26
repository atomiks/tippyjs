import {h} from '../../utils';

import tippy from '../../../src';
import inlinePositioning from '../../../src/plugins/inlinePositioning';

tippy.setDefaultProps({plugins: [inlinePositioning]});

describe('inlinePositioning', () => {
  it('does not have its popper modifier removed when updating popperOptions', () => {
    const instance = tippy(h());

    instance.setProps({
      popperOptions: {},
    });

    expect(instance.props.popperOptions).toMatchSnapshot();
  });
});
