import {State} from '@popperjs/core';
import {Props} from './types';

export interface ListenerObject {
  node: Element;
  eventType: string;
  handler: EventListenerOrEventListenerObject;
  options: boolean | Record<string, unknown>;
}

export interface PopperTreeData {
  popperRect: ClientRect;
  popperState: State;
  props: Props;
}

export interface PopperChildren {
  box: HTMLDivElement;
  content: HTMLDivElement;
  arrow?: HTMLDivElement;
  backdrop?: HTMLDivElement;
}
