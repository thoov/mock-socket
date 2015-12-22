/*
* This loads all of the globals needed for mocksockets and mockserver to work correctly.
* This should be the first import in the test loader.
*/

/* jshint ignore:start */
import QUnit from 'qunit';
import main from './src/main';

import networkBridgeTest from './unit/network-bridge-test';
import eventTargetInheritance from './unit/event-target-test';
import factoryTest from './unit/factory-test';
import websocketTest from './unit/websocket-test';
import serverTest from './unit/server-test';
import socketIOTest from './unit/socket-io-test';

import websocketFunctionalTest from './functional/websockets-test';
import socketIOFunctionalTest from './functional/socket-io-test';

import issue13 from './bug-reports/issue-13-test';
import issue19 from './bug-reports/issue-19-test';
import issue64 from './bug-reports/issue-64-test';
import issue65 from './bug-reports/issue-65-test';

QUnit.config.testTimeout = 10000;

window.QUnit = QUnit;
/* jshint ignore:end */
