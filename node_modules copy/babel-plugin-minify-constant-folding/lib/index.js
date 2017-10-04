"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var evaluate = require("babel-helper-evaluate-path");

var _require = require("./replacements"),
    FALLBACK_HANDLER = _require.FALLBACK_HANDLER;

function getName(member) {
  if (member.computed) {
    switch (member.property.type) {
      case "StringLiteral":
      case "NumericLiteral":
        return member.property.value;
      case "TemplateLiteral":
        return;
    }
  } else {
    return member.property.name;
  }
}

function swap(path, member, handlers) {
  var key = getName(member);
  if (key === undefined) return;
  var handler = handlers[key];
  if (typeof handler !== "function" || !Object.hasOwnProperty.call(handlers, key)) {
    if (typeof handlers[FALLBACK_HANDLER] === "function") {
      handler = handlers[FALLBACK_HANDLER].bind(member.object, key);
    } else {
      return false;
    }
  }

  for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var replacement = handler.apply(member.object, args);
  if (replacement) {
    path.replaceWith(replacement);
    return true;
  }
  return false;
}

module.exports = function (babel) {
  var replacements = require("./replacements.js")(babel);
  var seen = Symbol("seen");
  var t = babel.types,
      traverse = babel.traverse;


  return {
    name: "minify-constant-folding",
    visitor: {
      // Evaluate string expressions that are next to each other
      // but are not actually a binary expression.
      // "a" + b + "c" + "d" -> "a" + b + "cd"
      BinaryExpression(path) {
        var literal = void 0,
            bin = void 0;
        if (path.get("right").isStringLiteral()) {
          literal = path.get("right");
          if (path.get("left").isBinaryExpression({ operator: "+" })) {
            bin = path.get("left");
          } else {
            return;
          }
        } else if (path.get("left").isStringLiteral()) {
          literal = path.get("left");
          if (path.get("right").isBinaryExpression({ operator: "+" })) {
            bin = path.get("right");
          } else {
            return;
          }
        } else {
          return;
        }

        var relevant = getLeaf(bin, literal.key);

        if (!relevant) {
          return;
        }

        var value = literal.key === "right" ? relevant.node.value + literal.node.value : literal.node.value + relevant.node.value;

        relevant.replaceWith(t.stringLiteral(value));
        path.replaceWith(bin.node);

        function getLeaf(path, direction) {
          if (path.isStringLiteral()) {
            return path;
          } else if (path.isBinaryExpression({ operator: "+" })) {
            return getLeaf(path.get(direction), direction);
          }
        }
      },

      // TODO: look into evaluating binding too (could result in more code, but gzip?)
      Expression(path) {
        var node = path.node;


        if (node[seen]) {
          return;
        }

        if (path.isLiteral()) {
          return;
        }

        if (!path.isPure()) {
          return;
        }

        if (traverse.hasType(node, path.scope, "Identifier", t.FUNCTION_TYPES)) {
          return;
        }

        // -0 maybe compared via dividing and then checking against -Infinity
        // Also -X will always be -X.
        if (t.isUnaryExpression(node, { operator: "-" }) && t.isNumericLiteral(node.argument)) {
          return;
        }

        // We have a transform that converts true/false to !0/!1
        if (t.isUnaryExpression(node, { operator: "!" }) && t.isNumericLiteral(node.argument)) {
          if (node.argument.value === 0 || node.argument.value === 1) {
            return;
          }
        }

        // void 0 is used for undefined.
        if (t.isUnaryExpression(node, { operator: "void" }) && t.isNumericLiteral(node.argument, { value: 0 })) {
          return;
        }

        var res = evaluate(path);
        if (res.confident) {
          // Avoid fractions because they can be longer than the original expression.
          // There is also issues with number percision?
          if (typeof res.value === "number" && !Number.isInteger(res.value)) {
            return;
          }

          // Preserve -0
          if (typeof res.value === "number" && res.value === 0) {
            if (1 / res.value === -Infinity) {
              var _node2 = t.unaryExpression("-", t.numericLiteral(0), true);
              _node2[seen] = true;
              path.replaceWith(_node2);
              return;
            }
          }

          var _node = t.valueToNode(res.value);
          _node[seen] = true;
          path.replaceWith(_node);
        }
      },
      CallExpression(path) {
        var node = path.node;
        var member = node.callee;

        if (t.isMemberExpression(member)) {
          var helpers = replacements[member.object.type];
          if (!helpers || !helpers.calls) return;
          swap.apply(undefined, [path, member, helpers.calls].concat(_toConsumableArray(node.arguments)));
        }
      },
      MemberExpression(path) {
        var member = path.node;

        var helpers = replacements[member.object.type];
        if (!helpers || !helpers.members) return;
        swap(path, member, helpers.members);
      }
    }
  };
};