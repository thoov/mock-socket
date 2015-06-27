/*
* This loads all of the globals needed for mocksockets and mockserver to work correctly.
* This should be the first import in the test loader.
*/
import main from './src/main';

import basicTest from './basic-test';
import eventTargetInheritance from './event-target-inheritance-test';
import messageEventTest from './message-event-test';
import multipleClientsTest from './multiple-clients-test';
import onCloseTest from './on-close-test';
import onErrorTest from './on-error-test';
import onMessageTest from './on-message-test';
import updateReadyStateTest from './update-readystate-test';
import urlTransformTest from './url-transform-test';

import issue13 from './bug-reports/issue-13-test';
import issue19 from './bug-reports/issue-19-test';
