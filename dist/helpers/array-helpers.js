(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.arrayHelpers = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.reject = reject;
  exports.filter = filter;
  function reject(array, callback) {
    const results = [];
    array.forEach(itemInArray => {
      if (!callback(itemInArray)) {
        results.push(itemInArray);
      }
    });

    return results;
  }

  function filter(array, callback) {
    const results = [];
    array.forEach(itemInArray => {
      if (callback(itemInArray)) {
        results.push(itemInArray);
      }
    });

    return results;
  }
});