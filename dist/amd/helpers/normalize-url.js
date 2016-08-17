define('helpers/normalize-url', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = normalizeUrl;

  function normalizeUrl(url) {
    var parts = url.split('://');
    return parts[1] && parts[1].indexOf('/') === -1 ? url + '/' : url;
  }
});