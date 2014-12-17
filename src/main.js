// Starting point for browserify and throws important objects into the window object
var protocol      = require('./protocol');
var mockServer    = require('./mock-server');
var mockSocket    = require('./mock-socket');
var subject       = require('./helpers/subject');
var globalContext = require('./helpers/global-context');

globalContext.Subject    = subject;
globalContext.Protocol   = protocol;
globalContext.MockSocket = mockSocket;
globalContext.MockServer = mockServer;
