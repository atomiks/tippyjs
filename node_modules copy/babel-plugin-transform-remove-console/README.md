# babel-plugin-transform-remove-console

This plugin removes all `console.*` calls.

## Example

**In**

```javascript
console.log("foo");
console.error("bar");
```

**Out**

```javascript
```

## Installation

```sh
npm install babel-plugin-transform-remove-console
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-remove-console"]
}
```

### Via CLI

```sh
babel --plugins transform-remove-console script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-remove-console"]
});
```
