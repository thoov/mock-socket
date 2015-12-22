import assert from 'assert';
import { createEvent } from '../src/event-factory';
import EventTarget from '../src/event-target';

class Mock extends EventTarget {}
class MockFoo extends EventTarget {}

describe('Unit - EventTarget', function unitTest() {
  it('has all the required methods', () => {
    const mock = new Mock();

    assert.ok(mock.addEventListener);
    assert.ok(mock.removeEventListener);
    assert.ok(mock.dispatchEvent);
  });

  it('adding/removing "message" event listeners works', () => {
    const mock = new Mock();
    const eventObject = createEvent({
      type: 'message',
    });

    const fooListener = (event) => { assert.equal(event.type, 'message'); };
    const barListener = (event) => { assert.equal(event.type, 'message'); };

    mock.addEventListener('message', fooListener);
    mock.addEventListener('message', barListener);
    mock.dispatchEvent(eventObject);

    mock.removeEventListener('message', fooListener);
    mock.dispatchEvent(eventObject);

    mock.removeEventListener('message', barListener);
    mock.dispatchEvent(eventObject);
  });

  it('events to different object should not share events', () => {
    const mock = new Mock();
    const mockFoo = new MockFoo();
    const eventObject = createEvent({
      type: 'message',
    });

    const fooListener = (event) => { assert.equal(event.type, 'message'); };
    const barListener = (event) => { assert.equal(event.type, 'message'); };

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

  it('that adding the same function twice for the same event type is only added once', () => {
    const mock = new Mock();
    const fooListener = (event) => { assert.equal(event.type, 'message'); };
    const barListener = (event) => { assert.equal(event.type, 'message'); };

    mock.addEventListener('message', fooListener);
    mock.addEventListener('message', fooListener);
    mock.addEventListener('message', barListener);

    assert.equal(mock.listeners.message.length, 2);
  });
});
