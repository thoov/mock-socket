import QUnit from 'qunit';
import urlTransform from './src/helpers/url-transform';

QUnit.module('Url Transform Tests');

QUnit.test('Url transform is done correctly', function(assert) {
  assert.equal(urlTransform('ws://localhost:8080'), 'ws://localhost:8080/');
  assert.equal(urlTransform('ws://localhost:8080/'), 'ws://localhost:8080/');
  assert.equal(urlTransform('ws://localhost:8080/foo'), 'ws://localhost:8080/foo');
  assert.equal(urlTransform('ws://localhost.com'), 'ws://localhost.com/');
  assert.equal(urlTransform('ws://localhost.com:8080/'), 'ws://localhost.com:8080/');
  assert.equal(urlTransform('ws://localhost.com/foo'), 'ws://localhost.com/foo');
  assert.equal(urlTransform('ws://localhost.com/foo/'), 'ws://localhost.com/foo/');
  assert.equal(urlTransform('ws://localhost.com?foo=bar'), 'ws://localhost.com/?foo=bar');
  assert.equal(urlTransform('ws://localhost.com/foo?foo=bar'), 'ws://localhost.com/foo?foo=bar');
  assert.equal(urlTransform('ws://localhost:8080?foo=bar&testing=true'), 'ws://localhost:8080/?foo=bar&testing=true');
  assert.equal(urlTransform('ws://localhost:8080/?foo=bar&testing=true'), 'ws://localhost:8080/?foo=bar&testing=true');
});
