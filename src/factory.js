import Server from './server';
import Network from './network';
import SocketIO from './socket-io';
import WebSocket from './websocket';

export default () => {
  const networkInstance = new Network();

  SocketIO.prototype.__getNetworkConnection = () => networkInstance;
  Server.prototype.__getNetworkConnection = () => networkInstance;
  WebSocket.prototype.__getNetworkConnection = () => networkInstance;

  const IO = url => new SocketIO(url);
  IO.connect = url => IO(url);

  return { WebSocket, SocketIO: IO, Server };
};
