import test from 'ava';
import EventTarget from './target';
import { createEvent } from './factory';

class Mock extends EventTarget {}
class MockFoo extends EventTarget {}

test('has all the required methods', t => {
  const mock = new Mock();

  t.is(typeof mock.addEventListener, 'function');
  t.is(typeof mock.removeEventListener, 'function');
  t.is(typeof mock.dispatchEvent, 'function');
});

test('adding/removing "message" event listeners works', t => {
  const mock = new Mock();
  const eventObject = createEvent({
    type: 'message'
  });

  const fooListener = event => t.is(event.type, 'message');
  const barListener = event => t.is(event.type, 'message');

  mock.addEventListener('message', fooListener);
  mock.addEventListener('message', barListener);
  mock.dispatchEvent(eventObject);

  mock.removeEventListener('message', fooListener);
  mock.dispatchEvent(eventObject);

  mock.removeEventListener('message', barListener);
  mock.dispatchEvent(eventObject);
});

test('events to different object should not share events', t => {
  const mock = new Mock();
  const mockFoo = new MockFoo();
  const eventObject = createEvent({
    type: 'message'
  });

  const fooListener = event => t.is(event.type, 'message');
  const barListener = event => t.is(event.type, 'message');

  mock.addEventListener('message', fooListener);
  mockFoo.addEventListener('message', barListener);
  mock.dispatchEvent(eventObject);
  mockFoo.dispatchEvent(eventObject);

  mock.removeEventListener('message', fooListener);
  mock.dispatchEvent(eventObject);
  mockFoo.dispatchEvent(eventObject);

  mockFoo.removeEventListener('message', barListener);
  mock.dispatchEvent(eventObject);
  mockFoo.dispatchEvent(eventObject);
});

test('that adding the same function twice for the same event type is only added once', t => {
  const mock = new Mock();
  const fooListener = event => t.is(event.type, 'message');
  const barListener = event => t.is(event.type, 'message');

  mock.addEventListener('message', fooListener);
  mock.addEventListener('message', fooListener);
  mock.addEventListener('message', barListener);

  t.is(mock.listeners.message.length, 2);
});

test('that dispatching an event with multiple data arguments works correctly', t => {
  const mock = new Mock();
  const eventObject = createEvent({
    type: 'message'
  });

  const fooListener = (...data) => {
    t.is(data.length, 3);
    t.is(data[0], 'foo');
    t.is(data[1], 'bar');
    t.is(data[2], 'baz');
  };

  mock.addEventListener('message', fooListener);
  mock.dispatchEvent(eventObject, 'foo', 'bar', 'baz');
});
