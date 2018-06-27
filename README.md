# Tippy.js

[![Build Status](https://travis-ci.org/atomiks/tippyjs.svg?branch=master)](https://travis-ci.org/atomiks/tippyjs)
[![npm Downloads](https://img.shields.io/npm/dt/tippy.js.svg)](https://www.npmjs.com/package/tippy.js)
![gzip Size](http://img.badgesize.io/https://unpkg.com/tippy.js/dist/tippy.all.min.js?compression=gzip&label=gzip%20size)
[![CDNJS](https://img.shields.io/cdnjs/v/tippy.js.svg)](https://cdnjs.com/libraries/tippy.js)

Tippy.js is a highly customizable vanilla JS tooltip/popover library powered by Popper.js.

## Demo and documentation

https://atomiks.github.io/tippyjs/

## Installation

```
npm install tippy.js
```

CDN: https://unpkg.com/tippy.js/dist/

## Basic usage

#### 1. Give elements a `title` attribute containing the tooltip content.

```html
<button title="Tooltip">Text</button>
<button title="Another tooltip">Text</button>
```

#### 2. Include the `tippy.all.min.js` script in your document, which automatically injects Tippy's CSS into `head`.

Use the full version link! Visit the link in `src` below to get the latest version.

```html
<script src="https://unpkg.com/tippy.js/dist/tippy.all.min.js"></script>
```

#### 3. Now call `tippy()` with a CSS selector to give them a nice tooltip!

```html
<script>
  tippy('button')
</script>
```

#### Basic example

```html
<!DOCTYPE html>
<html>
<head><title>Tippy Example</title></head>
<body>
  <!-- Elements with `title` attributes -->
  <button title="Tooltip">Text</button>
  <button title="Another tooltip">Text</button>

  <!-- Include Tippy -->
  <script src="https://unpkg.com/tippy.js/dist/tippy.all.min.js"></script>
  <!-- Initialize tooltips by calling the `tippy` function with a CSS selector -->
  <script>
    tippy('button')
  </script>
</body>
</html>
```

View the [docs](https://atomiks.github.io/tippyjs/) for details on all of the options you can supply to customize tooltips to suit your needs.

## API

`tippy(reference [, options]) => collection object`

`tippy.one(reference [, options]) => Tippy instance` (v2.5+)

`reference` can be:

- CSS selector string
- DOM element (`HTMLElement`, `SVGElement`)
- Array of DOM elements
- `NodeList`
- `Object` (virtual reference)

### Options

```js
tippy(reference, {
  // Available v2.3+ - If true, HTML can be injected in the title attribute
  allowTitleHTML: true,

  // If true, the tooltip's background fill will be animated (material effect)
  animateFill: true,

  // The type of animation to use
  animation: 'shift-away', // 'shift-toward', 'fade', 'scale', 'perspective'

  // Which element to append the tooltip to
  appendTo: document.body, // Element or Function that returns an element

  // Whether to display the arrow. Disables the animateFill option
  arrow: false,

  // Transforms the arrow element to make it larger, wider, skinnier, offset, etc.
  arrowTransform: '', // CSS syntax: 'scaleX(0.5)', 'scale(2)', 'translateX(5px)' etc.

  // The type of arrow. 'sharp' is a triangle and 'round' is an SVG shape
  arrowType: 'sharp', // 'round'

  // The tooltip's Popper instance is not created until it is shown for the first
  // time by default to increase performance
  createPopperInstanceOnInit: false,

  // Delays showing/hiding a tooltip after a trigger event was fired, in ms
  delay: 0, // Number or Array [show, hide] e.g. [100, 500]

  // How far the tooltip is from its reference element in pixels
  distance: 10,

  // The transition duration
  duration: [350, 300], // Number or Array [show, hide]

  // If true, whenever the title attribute on the reference changes, the tooltip
  // will automatically be updated
  dynamicTitle: false,

  // If true, the tooltip will flip (change its placement) if there is not enough
  // room in the viewport to display it
  flip: true,

  // The behavior of flipping. Use an array of placement strings, such as
  // ['right', 'bottom'] for the tooltip to flip to the bottom from the right
  // if there is not enough room
  flipBehavior: 'flip', // 'clockwise', 'counterclockwise', Array

  // Whether to follow the user's mouse cursor or not
  followCursor: false,

  // Upon clicking the reference element, the tooltip will hide.
  // Disable this if you are using it on an input for a focus trigger
  // Use 'persistent' to prevent the tooltip from closing on body OR reference
  // click
  hideOnClick: true, // false, 'persistent'

  // Specifies that the tooltip should have HTML content injected into it.
  // A selector string indicates that a template should be cloned, whereas
  // a DOM element indicates it should be directly appended to the tooltip
  html: false, // 'selector', DOM Element

  // Adds an inertial slingshot effect to the animation. TIP! Use a show duration
  // that is twice as long as hide, such as `duration: [600, 300]`
  inertia: false,

  // If true, the tooltip becomes interactive and won't close when hovered over
  // or clicked
  interactive: false,

  // Specifies the size in pixels of the invisible border around an interactive
  // tooltip that prevents it from closing. Useful to prevent the tooltip
  // from closing from clumsy mouse movements
  interactiveBorder: 2,

  // Available v2.2+ - If false, the tooltip won't update its position (or flip)
  // when scrolling
  livePlacement: true,

  // The maximum width of the tooltip. Add units such as px or rem
  // Avoid exceeding 300px due to mobile devices, or don't specify it at all
  maxWidth: '',

  // If true, multiple tooltips can be on the page when triggered by clicks
  multiple: false,

  // Offsets the tooltip popper in 2 dimensions. Similar to the distance option,
  // but applies to the parent popper element instead of the tooltip
  offset: 0, // '50, 20' = 50px x-axis offset, 20px y-axis offset

  // Callback invoked when the tooltip fully transitions out
  onHidden(instance) {},

  // Callback invoked when the tooltip begins to transition out
  onHide(instance) {},

  // Callback invoked when the tooltip begins to transition in
  onShow(instance) {},

  // Callback invoked when the tooltip has fully transitioned in
  onShown(instance) {},

  // If true, data-tippy-* attributes will be disabled for increased performance
  performance: false,

  // The placement of the tooltip in relation to its reference
  placement: 'top', // 'bottom', 'left', 'right', 'top-start', 'top-end', etc.

  // Popper.js options. Allows more control over tooltip positioning and behavior
  popperOptions: {},

  // The size of the tooltip
  size: 'regular', // 'small', 'large'

  // If true, the tooltip's position will be updated on each animation frame so
  // the tooltip will stick to its reference element if it moves
  sticky: false,

  // Available v2.1+ - CSS selector string used for event delegation
  target: null, // e.g. '.className'

  // The theme, which is applied to the tooltip element as a class name, i.e.
  // 'dark-theme'. Add multiple themes by separating each by a space, such as
  // 'dark custom'
  theme: 'dark',

  // Changes trigger behavior on touch devices. It will change it from a tap
  // to show and a tap off to hide, to a touch-and-hold to show, and a release
  // to hide
  touchHold: false,

  // The events on the reference element which cause the tooltip to show
  trigger: 'mouseenter focus', // 'click', 'manual'

  // Transition duration applied to the Popper element to transition between
  // position updates
  updateDuration: 350,

  // The z-index of the popper
  zIndex: 9999
})
```

### Methods

```js
const instance = tippy.one(reference)
```

- `instance.show([duration])` - show the tippy, optional duration argument in ms
- `instance.hide([duration])` - hide the tippy, optional duration argument in ms
- `instance.enable()` - enable the tippy to allow it to show or hide
- `instance.disable()` - disable the tippy to prevent it from showing or hiding
- `instance.destroy()` - destroy the tippy, remove listeners and restore title attribute

### Component / Library Wrappers

- [Hyperapp Component](https://gist.github.com/atomiks/47a8f4e7c0a3823282974eb2de80ebec)
- [React Component](https://gist.github.com/atomiks/25ba93a551fc1e8a1ef18aa7669c6699)
