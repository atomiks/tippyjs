# Tippy.js

[![Build Status](https://travis-ci.org/atomiks/tippyjs.svg?branch=master)](https://travis-ci.org/atomiks/tippyjs)
[![npm Downloads](https://img.shields.io/npm/dt/tippy.js.svg)](https://www.npmjs.com/package/tippy.js)
![gzip Size](http://img.badgesize.io/https://unpkg.com/tippy.js/dist/tippy.all.min.js?compression=gzip&label=gzip%20size)

Tippy.js is a lightweight, vanilla JS tooltip library powered by Popper.js.

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
