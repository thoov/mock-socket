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

import websocketFunctionalTest from './functional/websockets-test';

import issue13 from './bug-reports/issue-13-test';
import issue19 from './bug-reports/issue-19-test';

window.QUnit = QUnit;
/* jshint ignore:end */
