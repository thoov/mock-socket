import utf8ByteLength from '../helpers/utf8-byte-length';
import { createMessageEvent } from '../event-factory';

export default (websocket, data) => {
  setTimeout(() => {
    const messageEvent = createMessageEvent({
      type: 'message',
      origin: websocket.url,
      data
    });

    if (typeof data === 'string') {
      websocket.bufferedAmount = utf8ByteLength(data);
    } else if (data.constructor === Blob) {
      // var debug = { hello: "world" };
      // var blob = new Blob([JSON.stringify(debug, null, 2)], {type : 'application/json'});
      websocket.bufferedAmount = data.size;
    } else if (data.constructor === ArrayBuffer) {
      websocket.bufferedAmount = data.byteLength;
    }

    const server = websocket.__getNetworkConnection().serverLookup(websocket.url);

    if (server) {
      server.dispatchEvent(messageEvent, data);
    }
  }, 0);
};
