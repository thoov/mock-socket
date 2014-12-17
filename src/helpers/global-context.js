/*
* Determines the global context. This should be either window (in the)
* case where we are in a browser) or global (in the case where we are in
* node)
*/
var globalContext = window || global;

if (!globalContext) {
  throw new Error('Unable to set the global context to either window or global.');
}

module.exports = globalContext;
