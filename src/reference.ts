import {ReferenceElement, Props, Plugin} from './types';
import {defaultProps, getExtendedProps} from './props';

const keys = Object.keys(defaultProps);

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
export function getDataAttributeProps(
  reference: ReferenceElement,
  plugins: Plugin[],
): Props {
  const props = (plugins
    ? Object.keys(getExtendedProps({...defaultProps, plugins}))
    : keys
  ).reduce((acc: any, key): Partial<Props> => {
    const valueAsString = (
      reference.getAttribute(`data-tippy-${key}`) || ''
    ).trim();

    if (!valueAsString) {
      return acc;
    }

    if (key === 'content') {
      acc[key] = valueAsString;
    } else {
      try {
        acc[key] = JSON.parse(valueAsString);
      } catch (e) {
        acc[key] = valueAsString;
      }
    }

    return acc;
  }, {});

  return props;
}
