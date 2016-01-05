'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function isNode() {
  if (typeof window === 'undefined') {
    return true;
  }

  return false;
}

exports['default'] = {
  globalContext: isNode() ? global : window,
  isNode: isNode
};
module.exports = exports['default'];