var MockSocket = require('./mock-socket');

function MockSocketIO(url) {
  var socket = new MockSocket(url);
  socket._isSocketIO = true;
  return socket;
}

/*
 * alias io(url)
 */
MockSocketIO.connect = function(url) {
  return MockSocketIO(url);
};

module.exports = MockSocketIO;
