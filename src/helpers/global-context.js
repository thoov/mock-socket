/*
* Determines the global context. This should be either window (in the)
* case where we are in a browser) or global (in the case where we are in
* node)
*/
var globalContext;

if(typeof window === 'undefined') {
    globalContext = global;
}
else {
    globalContext = window;
}

if (!globalContext) {
  throw new Error('Unable to set the global context to either window or global.');
}

module.exports = globalContext;
