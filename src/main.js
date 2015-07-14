import Service from './service';
import MockServer from './server';
import MockSocket from './websocket';
import globalContext from './helpers/global-context';

globalContext.SocketService = Service;
globalContext.MockSocket    = MockSocket;
globalContext.MockServer    = MockServer;
