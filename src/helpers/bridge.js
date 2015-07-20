import createEvent from './event-factory';

class Bridge {
  constructor() {
    this.urlMap = {};
  }

  /*
  *
  */
  connect(websocket, url) {
    var connectionLookup = this.urlMap[url];
    if(connectionLookup && connectionLookup.server) {

      if(!connectionLookup.websockets) {
        connectionLookup.websockets = [];
      }

      if(connectionLookup.websockets.indexOf(websocket) === -1) {
        connectionLookup.websockets.push(websocket);
      }

      websocket.readyState = WebSocket.OPEN;
      return connectionLookup.server;
    }

    var errorEvent = createEvent({
      type: 'error',
      target: websocket
    });
    websocket.readyState = WebSocket.CLOSED;
    websocket.dispatchEvent(errorEvent);

    console.error(`WebSocket connection to '${url}' failed`);
  }

  /*
  *
  */
  attachServer(server, url) {
    var connectionLookup = this.urlMap[url];

    if(!connectionLookup) {
      this.urlMap[url] = {
        server,
        websockets: []
      };

      return server;
    }

    var errorEvent = createEvent({
      type: 'error'
    });
    server.dispatchEvent(errorEvent);
  }

  broadcast(url, event) {
    var connectionLookup = this.urlMap[url];
    var websockets = connectionLookup.websockets;

    websockets.forEach(socket => {
      event.target = socket;
      event.srcElement = socket;
      event.currentTarget = socket;
      socket.dispatchEvent(event);
    });
  }

  flush() {
    this.urlMap = {};
  }
}

export default new Bridge();
