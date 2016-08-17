define("helpers/array-helpers", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.reject = reject;
  exports.filter = filter;

  function reject(array, callback) {
    var results = [];
    array.forEach(function (itemInArray) {
      if (!callback(itemInArray)) {
        results.push(itemInArray);
      }
    });

    return results;
  }

  function filter(array, callback) {
    var results = [];
    array.forEach(function (itemInArray) {
      if (callback(itemInArray)) {
        results.push(itemInArray);
      }
    });

    return results;
  }
});