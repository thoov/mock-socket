import QUnit from 'qunit';
import {
  createEvent,
  createMessageEvent
} from './src/factory';

QUnit.module('Unit - Factory Methods');

QUnit.test('that createEvent works', assert => {
  assert.expect(1);

  var event = createEvent({
    type: 'message'
  });

  debugger;

  assert.equal(event.type, 'message');
});
