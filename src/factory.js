import Server from './server';
import WebSocket from './websocket';
import NetworkBridge from './network-bridge';

export default () => {
  const networkBridge = new NetworkBridge();

  // eslint-disable-next-line no-underscore-dangle
  WebSocket.prototype.__getNetworkConnection = () => networkBridge;
  // eslint-disable-next-line no-underscore-dangle
  Server.prototype.__getNetworkConnection = () => networkBridge;

  return { WebSocket, Server };
};
