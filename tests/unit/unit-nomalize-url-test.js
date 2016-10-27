import assert from 'assert';
import normalize from '../../src/helpers/normalize-url';

describe('Unit - Normalize Url', () => {
  it('that normalize correctly adds a / to the url', () => {
    assert.equal(normalize('ws://example.com'), 'ws://example.com/');
    assert.equal(normalize('ws://example.com:7000'), 'ws://example.com:7000/');
    assert.equal(normalize('ws://example.com:7000/foo'), 'ws://example.com:7000/foo');
    assert.equal(normalize('ws://example.com:7000/foo/'), 'ws://example.com:7000/foo/');
  });
});
