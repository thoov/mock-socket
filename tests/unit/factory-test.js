import QUnit from 'qunit';
import {
  createEvent,
  createMessageEvent
} from '../src/factory';

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
  assert.expect(8);

  var event = createEvent({
    type: 'open'
  });

  assert.equal(event.type, 'open', 'the type property is set');
  assert.ok(event instanceof Event, 'event is truly an Event');
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

QUnit.test('that createEvent correctly creates an event', assert => {
  assert.expect(10);

  var event = createMessageEvent({
    type: 'message',
    origin: 'ws://localhost:8080',
    data: 'Testing'
  });

  assert.equal(event.type, 'message', 'the type property is set');
  assert.equal(event.data, 'Testing', 'the data property is set');
  assert.equal(event.origin, 'ws://localhost:8080', 'the origin property is set');
  assert.ok(event instanceof MessageEvent, 'event is truly a MessageEvent');
  assert.equal(event.target, null, 'target is null as no target was passed');
  assert.equal(event.srcElement, null, 'srcElement is null as no target was passed');
  assert.equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createEvent({
    type: 'message',
    origin: 'ws://localhost:8080',
    data: 'Testing',
    target: fakeObject
  });

  assert.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  assert.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  assert.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
});
