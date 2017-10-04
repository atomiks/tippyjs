"use strict";

module.exports = function evaluate(path) {
  try {
    return path.evaluate();
  } catch (e) {
    return {
      confident: false,
      error: e
    };
  }
};