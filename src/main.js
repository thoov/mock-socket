// Starting point for browserify and throws important objects into the window object
var Service       = require('./service');
var MockServer    = require('./mock-server');
var MockSocket    = require('./mock-socket');
var MockSocketIO  = require('./mock-socket-io');
var globalContext = require('./helpers/global-context');

globalContext.SocketService = Service;
globalContext.MockSocket    = MockSocket;
globalContext.MockSocketIO  = MockSocketIO;
globalContext.MockServer    = MockServer;
