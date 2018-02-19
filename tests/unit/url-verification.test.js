import test from 'ava';
import urlVerification from '../../src/helpers/url-verification';

test('that no url throws an error', t => {
  const error = t.throws(() => {
    urlVerification();
  }, TypeError);

  t.is(error.message, "Failed to construct 'WebSocket': 1 argument required, but only 0 present.");
});

test('if the url is invalid it throws an error', t => {
  const error = t.throws(() => {
    urlVerification('something-that-is-not-a-url');
  }, SyntaxError);

  t.is(error.message, "Failed to construct 'WebSocket': The URL 'something-that-is-not-a-url' is invalid.");
});

test('that if the protocol is not ws: or wss: it throws an error', t => {
  const error = t.throws(() => {
    urlVerification('http://foobar.com');
  }, SyntaxError);

  // eslint-disable-next-line max-len
  t.is(
    error.message,
    "Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. 'http:' is not allowed."
  );
});

test('that if the protocol is not ws: or wss: it throws an error', t => {
  const error = t.throws(() => {
    urlVerification('http://foobar.com');
  }, SyntaxError);

  // eslint-disable-next-line max-len
  t.is(
    error.message,
    "Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. 'http:' is not allowed."
  );
});

test('that if the url contains a fragment it throws an error', t => {
  const error = t.throws(() => {
    urlVerification('ws://foobar.com/#hash');
  }, SyntaxError);

  /* eslint-disable max-len */
  t.is(
    error.message,
    "Failed to construct 'WebSocket': The URL contains a fragment identifier ('#hash'). Fragment identifiers are not allowed in WebSocket URLs."
  );
  /* eslint-enable max-len */
});

test('a valid url is returned', t => {
  t.is(urlVerification('ws://foobar.com'), 'ws://foobar.com/');
  t.is(urlVerification('ws://foobar.com/bar'), 'ws://foobar.com/bar');
});
