import Server from './server';
import WebSocket from './websocket';
import NetworkBridge from './network';

export default () => {
  const networkBridge = new NetworkBridge();

  Server.prototype.__getNetworkConnection = () => networkBridge;
  WebSocket.prototype.__getNetworkConnection = () => networkBridge;

  return { WebSocket, Server };
};
