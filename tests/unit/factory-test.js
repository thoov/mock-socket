import QUnit from 'qunit';
import {
  createEvent,
  createMessageEvent,
  createCloseEvent
} from '../src/event-factory';

const fakeObject = {foo: 'bar'};

QUnit.module('Unit - Factory');

QUnit.test('that the create methods throw errors if no type if specified', assert => {
  assert.expect(2);

  assert.throws(() => {
    createEvent();
  }, 'Cannot read property \'type\' of undefined');

  assert.throws(() => {
    createMessageEvent();
  }, 'Cannot read property \'type\' of undefined');
});

QUnit.test('that createEvent correctly creates an event', assert => {
  assert.expect(7);

  var event = createEvent({
    type: 'open'
  });

  assert.equal(event.type, 'open', 'the type property is set');
  assert.equal(event.target, null, 'target is null as no target was passed');
  assert.equal(event.srcElement, null, 'srcElement is null as no target was passed');
  assert.equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createEvent({
    type: 'open',
    target: fakeObject
  });

  assert.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  assert.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  assert.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
});

QUnit.test('that createMessageEvent correctly creates an event', assert => {
  assert.expect(11);

  var event = createMessageEvent({
    type: 'message',
    origin: 'ws://localhost:8080',
    data: 'Testing'
  });

  assert.equal(event.type, 'message', 'the type property is set');
  assert.equal(event.data, 'Testing', 'the data property is set');
  assert.equal(event.origin, 'ws://localhost:8080', 'the origin property is set');
  assert.equal(event.target, null, 'target is null as no target was passed');
  assert.equal(event.lastEventId, '', 'lastEventId is an empty string');
  assert.equal(event.srcElement, null, 'srcElement is null as no target was passed');
  assert.equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createMessageEvent({
    type: 'close',
    origin: 'ws://localhost:8080',
    data: 'Testing',
    target: fakeObject
  });

  assert.equal(event.lastEventId, '', 'lastEventId is an empty string');
  assert.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  assert.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  assert.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
});

QUnit.test('that createCloseEvent correctly creates an event', assert => {
  assert.expect(12);

  var event = createCloseEvent({
    type: 'close'
  });

  assert.equal(event.code, 0, 'the code property is set');
  assert.equal(event.reason, '', 'the reason property is set');
  assert.equal(event.target, null, 'target is null as no target was passed');
  assert.equal(event.wasClean, false, 'wasClean is false as the code is not 1000');
  assert.equal(event.srcElement, null, 'srcElement is null as no target was passed');
  assert.equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createCloseEvent({
    type: 'close',
    code: 1001,
    reason: 'my bad',
    target: fakeObject
  });

  assert.equal(event.code, 1001, 'the code property is set');
  assert.equal(event.reason, 'my bad', 'the reason property is set');
  assert.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  assert.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  assert.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');

  event = createCloseEvent({
    type: 'close',
    code: 1000,
  });

  assert.equal(event.wasClean, true, 'wasClean is true as the code is 1000');
});
