"use strict";

module.exports = function () {
  return {
    name: "transform-simplify-comparison-operators",
    visitor: {
      // simplify comparison operations if we're 100% certain
      // that each value will always be of the same type
      BinaryExpression(path) {
        var node = path.node;

        var op = node.operator;
        if (op !== "===" && op !== "!==") {
          return;
        }

        var left = path.get("left");
        var right = path.get("right");
        var strictMatch = left.baseTypeStrictlyMatches(right);
        if (strictMatch) {
          node.operator = node.operator.slice(0, -1);
        }
      }
    }
  };
};