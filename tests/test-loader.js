/*
* This loads all of the globals needed for mocksockets and mockserver to work correctly.
* This should be the first import in the test loader.
*/
import main from './src/main';

import websocketsTest from './websockets-test';

import basicTest from './basic-test';
//import onCloseTest from './on-close-test';
import eventTargetInheritance from './event-target-inheritance-test';
//import multipleClientsTest from './multiple-clients-test';
//import onCloseTest from './on-close-test';
//import onErrorTest from './on-error-test';
//import onMessageTest from './on-message-test';

//import issue13 from './bug-reports/issue-13-test';
//import issue19 from './bug-reports/issue-19-test';
