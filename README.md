# Tippy.js
[![Build Status](https://travis-ci.org/atomiks/tippyjs.svg?branch=master)](https://travis-ci.org/atomiks/tippyjs)
[![npm Downloads](https://img.shields.io/npm/dt/tippy.js.svg)](https://www.npmjs.com/package/tippy.js)

Tippy.js is a lightweight, vanilla JS tooltip library powered by Popper.js.

## Demo and documentation

https://atomiks.github.io/tippyjs/

## Installation

```
npm install --save tippy.js
```

CDN:
https://unpkg.com/tippy.js/dist

## Usage

Give elements a `title` attribute containing the tooltip content.
```html
<button title="Tooltip">Text</button>
<button title="Another tooltip">Text</button>
```
Now call `tippy()` with a CSS selector to give it a nice tooltip!
```js
tippy('button')
```

View the [docs](https://atomiks.github.io/tippyjs/) for details on all of the options you can supply to customize tooltips to suit your needs.

