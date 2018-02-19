import test from 'ava';
import protocolVerification from '../../src/helpers/protocol-verification';

test('a non array or string protocol throws an error', t => {
  const error = t.throws(() => {
    protocolVerification(false);
  }, SyntaxError);

  t.is(error.message, "Failed to construct 'WebSocket': The subprotocol 'false' is invalid.");
});

test('if a protocol is duplicated it throws an error', t => {
  const error = t.throws(() => {
    protocolVerification(['foo', 'bar', 'foo']);
  }, SyntaxError);

  t.is(error.message, "Failed to construct 'WebSocket': The subprotocol 'foo' is duplicated.");
});

test('no protocol returns an empty array', t => {
  t.deepEqual(protocolVerification(), []);
});

test('passing an unique array of protocols returns an array of those protocols', t => {
  t.deepEqual(protocolVerification(['foo', 'bar']), ['foo', 'bar']);
});
