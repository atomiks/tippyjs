"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isPlainObject = require("lodash.isplainobject");

/**
 * Options Manager
 *
 * Input Options: Object
 * Output: Array of plugins enabled with their options
 *
 * Handles multiple types of input option keys
 *
 * 1. boolean and object values
 * { mangle: true } // should enable mangler
 * { mangle: { blacklist: ["foo"] } } // should enabled mangler
 *                                    // and pass obj to mangle plugin
 *
 * 2. group
 * { unsafe: true } // should enable all plugins under unsafe
 * { unsafe: { flip: false } } // should disable flip-comparisons plugin
 *                             // and other plugins should take their defaults
 * { unsafe: { simplify: {multipass: true}}} // should pass obj to simplify
 *                                           // other plugins take defaults
 *
 * 3. same option passed on to multiple plugins
 * { keepFnames: false } // should be passed on to mangle & dce
 *                       // without disturbing their own options
 */

module.exports = {
  option,
  proxy,
  group,
  generate,
  resolveOptions,
  generateResult
};

/**
 * Generate the plugin list from option tree and inputOpts
 */
function generate(optionTree, inputOpts) {
  return generateResult(resolveOptions(optionTree, inputOpts));
}

/**
 * Generate plugin list from the resolvedOptionTree
 * where resolvedOptionTree = for every node, node.resolved = true;
 */
function generateResult(resolvedOpts) {
  var options = resolvedOpts.children;
  var result = [];

  for (var i = 0; i < options.length; i++) {
    var _option = options[i];

    switch (_option.type) {
      case "option":
        if (_option.resolvedValue) {
          result.push(_option.resolvedValue);
        }
        break;
      case "group":
        result.push.apply(result, _toConsumableArray(generateResult(_option)));
        break;
    }
  }

  return result;
}

/**
 * Traverses input @param{optionTree} and adds resolvedValue
 * calculated from @param{inputOpts} for each Node in the tree
 */
function resolveOptions(optionTree) {
  var inputOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var options = optionTree.children;

  // a queue to resolve proxies at the end after all options groups are resolved
  var proxiesToResolve = [];

  for (var i = 0; i < options.length; i++) {
    var _option2 = options[i];
    switch (_option2.type) {
      case "option":
        resolveTypeOption(_option2, inputOpts);
        break;

      case "group":
        resolveTypeGroup(_option2, inputOpts);
        break;

      case "proxy":
        if (!hop(inputOpts, _option2.name)) {
          break;
        }
        proxiesToResolve.push(_option2);
        break;

      default:
        throw new TypeError("Option type not supported - " + _option2.type);
    }
  }

  // resolve proxies
  for (var _i = 0; _i < proxiesToResolve.length; _i++) {
    var _proxy = proxiesToResolve[_i];
    for (var j = 0; j < _proxy.to.length; j++) {
      var _option3 = _proxy.to[j];
      switch (_option3.type) {
        case "option":
          resolveTypeProxyToOption(_proxy, _option3, inputOpts);
          break;

        case "group":
        case "proxy":
          throw new Error(`proxy option cannot proxy to group/proxy. ${_proxy.name} proxied to ${_option3.name}`);

        default:
          throw new Error("Unsupported option type ${option.name}");
      }
    }
  }

  // return the same tree after modifications
  return optionTree;
}

/**
 * Resolve the type - simple option using the @param{inputOpts}
 */
function resolveTypeOption(option, inputOpts) {
  option.resolved = true;

  // option does NOT exist in inputOpts
  if (!hop(inputOpts, option.name)) {
    // default value
    option.resolvedValue = option.defaultValue ? option.resolvingValue : null;
    return;
  }

  // Object
  // { mangle: { blacklist: ["foo", "bar"] } }
  if (isPlainObject(inputOpts[option.name])) {
    option.resolvedValue = [option.resolvingValue, inputOpts[option.name]];
    return;
  }

  // any other truthy value, just enables the plugin
  // { mangle: true }
  if (inputOpts[option.name]) {
    option.resolvedValue = option.resolvingValue;
    return;
  }

  // disabled
  option.resolvedValue = null;
}

/**
 * Resolve the group using @param{inputOpts}
 */
function resolveTypeGroup(option, inputOpts) {
  option.resolved = true;

  // option does NOT exist in inputOpts
  if (!hop(inputOpts, option.name)) {
    var _newInputOpts = option.children.filter(function (opt) {
      return opt.type !== "proxy";
    }).reduce(function (acc, cur) {
      var value = void 0;
      switch (option.defaultValue) {
        case "all":
          value = true;
          break;
        case "some":
          value = cur.defaultValue;
          break;
        case "none":
          value = false;
          break;
        default:
          throw new Error(`Unsupported defaultValue - ${option.defaultValue} for option ${option.name}`);
      }
      return Object.assign({}, acc, {
        [cur.name]: value
      });
    }, {});

    // recurse
    resolveOptions(option, _newInputOpts);
    return;
  }

  // has individual options for items in group
  // { unsafe: { flipComparisons: true } }
  if (isPlainObject(inputOpts[option.name])) {
    resolveOptions(option, inputOpts[option.name]);
    return;
  }

  // else
  // { unsafe: <true | false> }
  var newInputOpts = option.children.filter(function (opt) {
    return opt.type !== "proxy";
  }).reduce(function (acc, cur) {
    return Object.assign({}, acc, {
      // if the input is truthy, enable all, else disable all
      [cur.name]: !!inputOpts[option.name]
    });
  }, {});
  resolveOptions(option, newInputOpts);
}

/**
 * Resolve proxies and update the already resolved Options
 */
function resolveTypeProxyToOption(proxy, option, inputOpts) {
  if (!option.resolved) {
    throw new Error("Proxies cannot be applied before the original option is resolved");
  }

  // option is disabled
  if (!option.resolvedValue) {
    return;
  }

  // option doesn't contain any option on its own
  if (option.resolvedValue === option.resolvingValue) {
    option.resolvedValue = [option.resolvedValue, {
      [proxy.name]: inputOpts[proxy.name]
    }];
  } else if (Array.isArray(option.resolvedValue) && option.resolvedValue.length === 2) {
    // option already has its own set of options to be passed to plugins
    // proxies should not override
    if (!hop(option.resolvedValue[1], proxy.name)) {
      option.resolvedValue = [option.resolvingValue, Object.assign({}, option.resolvedValue[1], {
        [proxy.name]: inputOpts[proxy.name]
      })];
    }
  } else {
    // plugin is invalid
    throw new Error(`Invalid resolved value for option ${option.name}`);
  }
}

// create an option of type simple option
function option(name, resolvingValue) {
  var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  assertName(name);
  if (!resolvingValue) {
    // as plugins are truthy values
    throw new Error("Only truthy resolving values are supported");
  }
  return {
    type: "option",
    name,
    resolvingValue,
    defaultValue
  };
}

// create an option of type proxy
function proxy(name, to) {
  assertName(name);
  assertArray(name, "to", to);
  return {
    type: "proxy",
    name,
    to
  };
}

// create an option of type - group of options
function group(name, children) {
  var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "some";

  assertName(name);
  assertArray(name, "children", children);
  return {
    type: "group",
    name,
    children: children.filter(function (x) {
      return !!x;
    }),
    defaultValue
  };
}

function hop(o, key) {
  return Object.hasOwnProperty.call(o, key);
}

function assertArray(name, prop, arr) {
  if (!Array.isArray(arr)) {
    throw new Error(`Expected ${prop} to be an array in option ${name}`);
  }
}

function assertName(name) {
  if (!name) {
    throw new Error("Invalid option name " + name);
  }
}