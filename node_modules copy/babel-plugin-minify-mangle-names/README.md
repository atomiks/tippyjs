# babel-plugin-minify-mangle-names

Context- and scope- aware variable renaming.

## Example

**In**

```javascript
var globalVariableName = 42;
function foo() {
  var longLocalVariableName = 1;
  if (longLocalVariableName) {
    console.log(longLocalVariableName);
  }
}
```

**Out**

```javascript
var globalVariableName = 42;
function foo() {
  var a = 1;
  if (a) {
    console.log(a);
  }
}
```

## Installation

```sh
npm install babel-plugin-minify-mangle-names
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
// without options
{
  "plugins": ["minify-mangle-names"]
}
```

```json
// with options
{
  "plugins": ["minify-mangle-names", { "blacklist": { "foo": true, "bar": true} }]
}
```

### Via CLI

```sh
babel --plugins minify-mangle-names script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["minify-mangle-names"]
});
```

## Options

+ `blacklist` - A plain JS Object with keys as identifier names and values indicating whether to exclude
+ `eval` - mangle identifiers in scopes accessible by eval
+ `keepFnName` - prevent mangler from altering function names. Useful for code depending on `fn.name`
+ `topLevel` - mangle topLevel Identifiers
+ `keepClassName` - prevent mangler from altering class names.
