import Service from './service';
import MockServer from './mock-server';
import MockSocket from './mock-socket';
import globalContext from './helpers/global-context';

globalContext.SocketService = Service;
globalContext.MockSocket    = MockSocket;
globalContext.MockServer    = MockServer;
