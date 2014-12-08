// Starting point for browserify and throws important objects into the window object
var protocol   = require('./protocol');
var mockserver = require('./mock-server');
var mocksocket = require('./mock-socket');
var subject    = require('./helpers/subject');

window.Subject = subject;
window.Protocol = protocol;
window.MockSocket = mocksocket;
window.WebSocketServer = mockserver;
