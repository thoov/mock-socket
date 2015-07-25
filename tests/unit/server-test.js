import QUnit from 'qunit';
import Server from '../src/server';
import EventTarget from '../src/event-target';
import networkBridge from '../src/network-bridge';

QUnit.module('Unit - Server');

QUnit.test('that server inherents EventTarget methods', assert => {
  assert.expect(1);

  var myServer = new Server('ws://not-real');
  assert.ok(myServer instanceof EventTarget);
});

QUnit.test('that after creating a server it is added to the network bridge', assert => {
  assert.expect(1);

  var myServer = new Server('ws://not-real/');
  var urlMap = networkBridge.urlMap['ws://not-real/'];

  assert.deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
});
