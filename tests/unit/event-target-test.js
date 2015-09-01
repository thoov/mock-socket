import QUnit from 'qunit';
import {
  createEvent
} from '../src/event-factory';
import EventTarget from '../src/event-target';

class Mock extends EventTarget {}
class MockFoo extends EventTarget {}

QUnit.module('Unit - EventTarget');

QUnit.test('has all the required methods', assert => {
  assert.expect(3);

  var mock = new Mock();

  assert.ok(mock.addEventListener);
  assert.ok(mock.removeEventListener);
  assert.ok(mock.dispatchEvent);
});

QUnit.test('adding/removing "message" event listeners works', assert => {
  assert.expect(3);

  var mock = new Mock();
  var event = createEvent({
    type: 'message'
  });

  var fooListener = (event) => { assert.equal(event.type, 'message'); };
  var barListener = (event) => { assert.equal(event.type, 'message'); };

  mock.addEventListener('message', fooListener);
  mock.addEventListener('message', barListener);
  mock.dispatchEvent(event);

  mock.removeEventListener('message', fooListener);
  mock.dispatchEvent(event);

  mock.removeEventListener('message', barListener);
  mock.dispatchEvent(event);
});

QUnit.test('events to different object should not share events', assert => {
  assert.expect(3);

  var mock = new Mock();
  var mockFoo = new MockFoo();
  var event = createEvent({
    type: 'message'
  });

  var fooListener = (event) => { assert.equal(event.type, 'message'); };
  var barListener = (event) => { assert.equal(event.type, 'message'); };

  mock.addEventListener('message', fooListener);
  mockFoo.addEventListener('message', barListener);
  mock.dispatchEvent(event);
  mockFoo.dispatchEvent(event);

  mock.removeEventListener('message', fooListener);
  mock.dispatchEvent(event);
  mockFoo.dispatchEvent(event);

  mockFoo.removeEventListener('message', barListener);
  mock.dispatchEvent(event);
  mockFoo.dispatchEvent(event);
});

QUnit.test('that adding the same function twice for the same event type is only added once', assert => {
  assert.expect(1);

  var mock        = new Mock();
  var fooListener = (event) => { assert.equal(event.type, 'message'); };
  var barListener = (event) => { assert.equal(event.type, 'message'); };

  mock.addEventListener('message', fooListener);
  mock.addEventListener('message', fooListener);
  mock.addEventListener('message', barListener);

  assert.equal(mock.listeners.message.length, 2);
});
