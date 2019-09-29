import {Props, Plugin} from './types';

export const defaultProps: Props = {
  allowHTML: true,
  animation: 'fade',
  appendTo: (): Element => document.body,
  aria: 'describedby',
  arrow: true,
  boundary: 'scrollParent',
  content: '',
  delay: 0,
  distance: 10,
  duration: [300, 250],
  flip: true,
  flipBehavior: 'flip',
  flipOnUpdate: false,
  hideOnClick: true,
  ignoreAttributes: false,
  inertia: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  lazy: true,
  maxWidth: 350,
  multiple: false,
  offset: 0,
  onAfterUpdate(): void {},
  onBeforeUpdate(): void {},
  onCreate(): void {},
  onDestroy(): void {},
  onHidden(): void {},
  onHide(): void | false {},
  onMount(): void {},
  onShow(): void | false {},
  onShown(): void {},
  onTrigger(): void {},
  onUntrigger(): void {},
  placement: 'top',
  popperOptions: {},
  role: 'tooltip',
  showOnCreate: false,
  theme: '',
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null,
  updateDuration: 0,
  zIndex: 9999,
};

/**
 * If the setProps() method encounters one of these, the popperInstance must be
 * recreated
 */
export const POPPER_INSTANCE_DEPENDENCIES: Array<keyof Props> = [
  'arrow',
  'boundary',
  'distance',
  'flip',
  'flipBehavior',
  'flipOnUpdate',
  'offset',
  'placement',
  'popperOptions',
];

export function getExtendedProps(props: Props, plugins: Plugin[]): Props {
  return {
    ...props,
    ...plugins.reduce<{[key: string]: any}>((acc, plugin) => {
      const {name, defaultValue} = plugin;

      if (name) {
        acc[name] = props[name] !== undefined ? props[name] : defaultValue;
      }

      return acc;
    }, {}),
  };
}
