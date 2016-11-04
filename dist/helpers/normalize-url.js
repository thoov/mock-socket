(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.normalizeUrl = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = normalizeUrl;
  function normalizeUrl(url) {
    var parts = url.split('://');
    return parts[1] && parts[1].indexOf('/') === -1 ? url + '/' : url;
  }
});