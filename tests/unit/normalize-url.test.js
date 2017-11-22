import test from 'ava';
import normalize from '../../src/helpers/normalize-url';

test('Unit - Normalize Url - correctly adds a / to the url and removes query paramters', t => {
  t.plan(6);

  t.is(normalize('ws://example.com'), 'ws://example.com/');
  t.is(normalize('ws://example.com:7000'), 'ws://example.com:7000/');
  t.is(normalize('ws://example.com:7000/foo'), 'ws://example.com:7000/foo');
  t.is(normalize('ws://example.com:7000/foo/'), 'ws://example.com:7000/foo/');
  t.is(normalize('ws://example.com:7000/foo/?client-id=client1234'), 'ws://example.com:7000/foo/');
  t.is(normalize('ws://example.com:7000?client-id=client1234&token=secret'), 'ws://example.com:7000/');
});
