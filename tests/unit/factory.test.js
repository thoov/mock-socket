import test from 'ava';
import { createEvent, createMessageEvent, createCloseEvent } from '../../src/event/factory';

const fakeObject = { foo: 'bar' };

test('that the create methods throw errors if no type if specified', t => {
  t.throws(() => createEvent(), "Cannot read property 'type' of undefined");
  t.throws(() => createMessageEvent(), "Cannot read property 'type' of undefined");
});

test('that createEvent correctly creates an event', t => {
  let event = createEvent({
    type: 'open'
  });

  t.is(event.type, 'open', 'the type property is set');
  t.is(event.target, null, 'target is null as no target was passed');
  t.is(event.srcElement, null, 'srcElement is null as no target was passed');
  t.is(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createEvent({
    type: 'open',
    target: fakeObject
  });

  t.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  t.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  t.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
});

test('that createMessageEvent correctly creates an event', t => {
  let event = createMessageEvent({
    type: 'message',
    origin: 'ws://localhost:8080',
    data: 'Testing'
  });

  t.is(event.type, 'message', 'the type property is set');
  t.is(event.data, 'Testing', 'the data property is set');
  t.is(event.origin, 'ws://localhost:8080', 'the origin property is set');
  t.is(event.target, null, 'target is null as no target was passed');
  t.is(event.lastEventId, '', 'lastEventId is an empty string');
  t.is(event.srcElement, null, 'srcElement is null as no target was passed');
  t.is(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createMessageEvent({
    type: 'close',
    origin: 'ws://localhost:8080',
    data: 'Testing',
    target: fakeObject
  });

  t.is(event.lastEventId, '', 'lastEventId is an empty string');
  t.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  t.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  t.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
});

test('that createCloseEvent correctly creates an event', t => {
  let event = createCloseEvent({
    type: 'close'
  });

  t.is(event.code, 0, 'the code property is set');
  t.is(event.reason, '', 'the reason property is set');
  t.is(event.target, null, 'target is null as no target was passed');
  t.is(event.wasClean, false, 'wasClean is false as the code is not 1000');
  t.is(event.srcElement, null, 'srcElement is null as no target was passed');
  t.is(event.currentTarget, null, 'currentTarget is null as no target was passed');

  event = createCloseEvent({
    type: 'close',
    code: 1001,
    reason: 'my bad',
    target: fakeObject
  });

  t.is(event.code, 1001, 'the code property is set');
  t.is(event.reason, 'my bad', 'the reason property is set');
  t.deepEqual(event.target, fakeObject, 'target is set to fakeObject');
  t.deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
  t.deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');

  event = createCloseEvent({
    type: 'close',
    code: 1000
  });

  t.is(event.wasClean, true, 'wasClean is true as the code is 1000');
});
