import {Props} from './types';

export interface ListenerObject {
  node: Element;
  eventType: string;
  handler: EventListenerOrEventListenerObject;
  options: boolean | object;
}

export interface PropsV4 extends Props {
  a11y: boolean;
  arrowType: 'sharp' | 'round';
  showOnInit: boolean;
  size: 'small' | 'regular' | 'large';
  target: string;
  touchHold: boolean;
}
