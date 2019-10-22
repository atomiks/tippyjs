# Migration Guide: v4 to v5

### Node

Make sure you have DEV warnings enabled by setting `NODE_ENV=development` and
ensuring your bundler replaces `process.env.NODE_ENV` with the string
`"development"`.

- **webpack**: via `mode` option
- **Rollup**: via `rollup-plugin-replace`
- **Parcel**: automatic
- **Browserify/Gulp/Grunt/others**:
  [View details](https://vuejs.org/v2/guide/deployment.html#With-Build-Tools)

### Browser

```html
<script src="https://unpkg.com/popper.js@1"></script>
<!-- Specify development file -->
<script src="https://unpkg.com/tippy.js@5/dist/tippy-bundle.iife.js"></script>
<!-- 
When you're finished, you can remove everything after @5 
(or when deploying for production) 
<script src="https://unpkg.com/tippy.js@5"></script>
-->
```

## Imports

Previously, the default import injected the CSS stylesheet into `<head>`:

```js
import tippy from 'tippy.js';
```

In v5, this import is now side-effect free to work better with dependencies when
users have CSP enabled or using frameworks that control the `<head>`.

You should import the CSS separately:

```js
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
```

You can however opt-in to use the injected CSS version, just like v4:

```js
// Just like v4
import tippy from 'tippy.js/dist/tippy-bundle.esm';

// Or CommonJS:
const tippy = require('tippy.js/dist/tippy-bundle.cjs');
```

## `data-tippy` attribute

This technique of auto initialization was removed to keep the import side-effect
free. Initializing via the `tippy()` constructor is required.

## Animations

### If you want the `animateFill` effect back (it's no longer default)

<details>
<summary>View details</summary>

Node:

```js
import tippy, {animateFill} from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// These stylesheets are required for it to work
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';

tippy(targets, {
  animateFill: true,
  plugins: [animateFill],
});
```

Browser:

```html
<link rel="stylesheet" href="https://unpkg.com/tippy.js@5/dist/backdrop.css" />
<link
  rel="stylesheet"
  href="https://unpkg.com/tippy.js@5/animations/shift-away.css"
/>
<script src="https://unpkg.com/popper.js@1"></script>
<script src="https://unpkg.com/tippy.js@5"></script>
<script>
  tippy(targets, {
    content: 'tooltip',
    animateFill: true,
  });
</script>
```

</details>

### If you were using default animations or creating custom animations

<details>
<summary>View details</summary>

- Make sure your `visible` state has no translation (of 0px, instead of 10px
  like before).
- `shift-away`, `shift-toward`, `scale` and `perspective` need to be imported
  separately now.

Node:

```js
import 'tippy.js/animations/scale.css';
```

Browser:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/tippy.js@5/animations/scale.css"
/>
```

</details>

## Props

### If you were using `interactive: true`

<details>
<summary>View details</summary>

When using `interactive: true`, the tippy may be invisible or appear cut off if
your reference element is in a container with:

- `position` (e.g. fixed, absolute, sticky)
- `overflow: hidden`

To fix add the following prop (recommended):

```js
tippy(reference, {
  // ...
  popperOptions: {
    positionFixed: true,
  },
});
```

Or, if the above causes issues:

```js
tippy(reference, {
  // ...
  appendTo: document.body,
});
```

⚠️ For the latter, you need to be employing focus mangement for accessibility.

</details>

### If you were using `arrowType: 'round'`

<details>
<summary>View details</summary>

Import the `svg-arrow` CSS, and the `roundArrow` string, and use the `arrow`
prop instead.

Node:

```js
import {roundArrow} from 'tippy.js';
import 'tippy.js/dist/svg-arrow.css';

tippy(targets, {
  arrow: roundArrow,
});
```

Browser:

```html
<link rel="stylesheet" href="https://unpkg.com/tippy.js@5/dist/svg-arrow.css" />
<script>
  tippy(targets, {
    arrow: tippy.roundArrow,
  });
</script>
```

</details>

### If you were using `followCursor`

<details>
<summary>View details</summary>

Node:

```js
import tippy, {followCursor} from 'tippy.js';

tippy('button', {
  followCursor: true,
  plugins: [followCursor],
});
```

Browser:

(Works as before.)

</details>

### If you were using `sticky`

<details>
<summary>View details</summary>

Node:

```js
import tippy, {sticky} from 'tippy.js';

tippy('button', {
  sticky: true,
  plugins: [sticky],
});
```

Browser:

(Works as before.)

</details>

### If you were using `target`

<details>
<summary>View details</summary>

Use `delegate()`.

Node:

```js
import tippy, {delegate} from 'tippy.js';

delegate('#parent', {target: 'button'});
```

Browser:

```html
<script src="https://unpkg.com/popper.js@1"></script>
<script src="https://unpkg.com/tippy.js@5"></script>
<script>
  tippy.delegate('#parent', {target: 'button'});
</script>
```

</details>

### If you were using `showOnInit`

<details>
<summary>View details</summary>

It's now named `showOnCreate`, to match the `onCreate` lifecycle hook

</details>

### If you were using `size`

<details>
<summary>View details</summary>

It's been removed, as it's more flexible to just use a theme and specify the
`font-size` and `padding` properties.

</details>

### If you were using `touchHold`

<details>
<summary>View details</summary>

Use `touch: "hold"` instead.

</details>

### If you were using `a11y`

<details>
<summary>View details</summary>

Ensure non-focusable elements have `tabindex="0"` added to them. Otherwise, use
natively focusable elements everywhere possible.

</details>

## Instances

### If you were using `instance.set()`

<details>
<summary>View details</summary>

```diff
- instance.set({});
+ instance.setProps({});
```

</details>

## Static methods

### If you were using `tippy.setDefaults()`

<details>
<summary>View details</summary>

```diff
- tippy.defaults;
+ tippy.defaultProps;
```

```diff
- tippy.setDefaults({});
+ tippy.setDefaultProps({});
```

</details>

### If you were using `tippy.hideAll()`

<details>
<summary>View details</summary>

In ESM/CJS contexts, it's no longer attached to `tippy`

Node:

```js
import {hideAll} from 'tippy.js';

hideAll();
```

Browser:

(Works as before.)

</details>

### If you were using `tippy.group()`

<details>
<summary>View details</summary>

Use `createSingleton()`.

Node:

```js
import tippy, {createSingleton} from 'tippy.js';

createSingleton(tippy('button'), {delay: 1000});
```

Browser:

```html
<script src="https://unpkg.com/popper.js@1"></script>
<script src="https://unpkg.com/tippy.js@5"></script>
<script>
  tippy.createSingleton(tippy('button'), {delay: 1000});
</script>
```

</details>

## Themes

### If you were using the included themes

<details>
<summary>View details</summary>

- `google` is now `material`

</details>

### If you were creating custom themes

<details>
<summary>View details</summary>

- `[x-placement]` attribute is now `[data-placement]`
- `[x-out-of-boundaries]` is now `[data-out-of-boundaries]`
- `.tippy-roundarrow` is now `.tippy-svg-arrow`
- `.tippy-tooltip` no longer has `padding` on it, rather the `.tippy-content`
  selector does.
- `.tippy-tooltip` no longer has `text-align: center`

</details>

## Other

### If you were using virtual reference objects

<details>
<summary>View details</summary>

Set `instance.popperInstance.reference = ReferenceObject` in the `onTrigger`
lifecycle, or `onCreate` with `lazy: false`.

</details>

## Types

<details>
<summary>View details</summary>

- `Props` is not `Partial` anymore, it's `Required`
- `Options` removed (use `Partial<Props>`)
- `BasicPlacement` renamed to `BasePlacement`

</details>
