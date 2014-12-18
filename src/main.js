// Starting point for browserify and throws important objects into the window object
var Service       = require('./service');
var MockServer    = require('./mock-server');
var MockSocket    = require('./mock-socket');
var globalContext = require('./helpers/global-context');

globalContext.SocketService = Service;
globalContext.MockSocket    = MockSocket;
globalContext.MockServer    = MockServer;
