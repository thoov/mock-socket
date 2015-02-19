module('Url Transform Tests');

test('Url transform is done correctly', function(){
  equal(urlTransform('ws://localhost:8080'), 'ws://localhost:8080/');
  equal(urlTransform('ws://localhost:8080/'), 'ws://localhost:8080/');
  equal(urlTransform('ws://localhost:8080/foo'), 'ws://localhost:8080/foo');
  equal(urlTransform('ws://localhost.com'), 'ws://localhost.com/');
  equal(urlTransform('ws://localhost.com:8080/'), 'ws://localhost.com:8080/');
  equal(urlTransform('ws://localhost.com/foo'), 'ws://localhost.com/foo');
  equal(urlTransform('ws://localhost.com/foo/'), 'ws://localhost.com/foo/');
});
