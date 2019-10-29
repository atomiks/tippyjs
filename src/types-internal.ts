export interface ListenerObject {
  node: Element;
  eventType: string;
  handler: EventListenerOrEventListenerObject;
  options: boolean | object;
}
