import QUnit from 'qunit';
import {
  createEvent
} from '../src/factory';
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
