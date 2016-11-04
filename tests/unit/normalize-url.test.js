import test from 'ava';
import normalize from '../../src/helpers/normalize-url';

test('Unit - Normalize Url - that normalize correctly adds a / to the url', (t) => {
  t.plan(4);

  t.is(normalize('ws://example.com'), 'ws://example.com/');
  t.is(normalize('ws://example.com:7000'), 'ws://example.com:7000/');
  t.is(normalize('ws://example.com:7000/foo'), 'ws://example.com:7000/foo');
  t.is(normalize('ws://example.com:7000/foo/'), 'ws://example.com:7000/foo/');
});
