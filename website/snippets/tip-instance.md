```js
{
  // id of the instance (1 to Infinity)
  id: 1,

  // Reference element that is the trigger for the tooltip
  reference: Element,

  // Popper element that contains the tooltip
  popper: Element,

  // Object that contains the child elements of the popper element
  popperChildren: { ... }

  // Popper instance is not created until shown for the first time,
  // unless specified otherwise
  popperInstance: null,

  // Instance props + attribute options merged together
  props: { ... },

  // The state of the instance
  state: {
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the instance enabled?
    isEnabled: true,
    // Is the tooltip currently visible and not transitioning out?
    isVisible: false
  },

  // Also contains methods, which you'll learn in the next section
}
```
