# Tippy.js

[![Build Status](https://travis-ci.org/atomiks/tippyjs.svg?branch=master)](https://travis-ci.org/atomiks/tippyjs)
[![npm Downloads](https://img.shields.io/npm/dt/tippy.js.svg)](https://www.npmjs.com/package/tippy.js)
![gzip Size](http://img.badgesize.io/https://unpkg.com/tippy.js/dist/tippy.all.min.js?compression=gzip&label=gzip%20size)

Tippy.js is a highly customizable vanilla JS tooltip and popover library powered by Popper.js.

## Demo and Documentation

https://atomiks.github.io/tippyjs/

## Installation

```
npm i tippy.js
```

CDN: https://unpkg.com/tippy.js/dist/

## Basic Usage

#### 1. Give elements a `data-tippy` attribute containing the tooltip content.

```html
<button data-tippy="Tooltip">Text</button>
<button data-tippy="Another tooltip">Text</button>
```

#### 2. Include the `tippy.all.min.js` script in your document.

```html
<script src="https://unpkg.com/tippy.js@3/dist/tippy.all.min.js"></script>
```

#### Basic example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Tippy Example</title>
  </head>
  <body>
    <!-- Elements with a `data-tippy` attribute -->
    <button data-tippy="Tooltip">Text</button>
    <button data-tippy="Another tooltip">Text</button>
    <!-- Specify option via attribute -->
    <button data-tippy="Another tooltip" data-tippy-delay="500">Delayed</button>

    <!-- Include Tippy -->
    <script src="https://unpkg.com/tippy.js@3/dist/tippy.all.min.js"></script>
    <!-- OPTIONAL: Set the defaults for the auto-initialized tooltips -->
    <script>
      tippy.setDefaults({
        arrow: true,
        delay: 40,
        theme: 'my-tippy'
      })
    </script>
  </body>
</html>
```

View the [docs](https://atomiks.github.io/tippyjs/) for details on all of the options you can supply to customize tooltips to suit your needs.

## Browser Support

IE11+: browsers that support `MutationObserver` and `requestAnimationFrame`.

## Component Wrappers

- [React component](https://github.com/atomiks/tippy.js-react)
