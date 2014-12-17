// Starting point for browserify and throws important objects into the window object
var protocol   = require('./protocol');
var mockServer = require('./mock-server');
var mockSocket = require('./mock-socket');
var subject    = require('./helpers/subject');

// Setting the global context to either window (in a browser) or global (in node)
var globalContext = window || global;

if (!globalContext) {
  throw new Error('Unable to set the global context to either window or global.');
}

globalContext.Subject    = subject;
globalContext.Protocol   = protocol;
globalContext.MockSocket = mockSocket;
globalContext.MockServer = mockServer;
