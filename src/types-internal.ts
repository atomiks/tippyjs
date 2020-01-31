import {Props, BasePlacement} from './types';

export interface ListenerObject {
  node: Element;
  eventType: string;
  handler: EventListenerOrEventListenerObject;
  options: boolean | object;
}

export interface PopperTreeData {
  popperRect: ClientRect;
  basePlacement: BasePlacement;
  offsetData: any;
  props: Props;
}
