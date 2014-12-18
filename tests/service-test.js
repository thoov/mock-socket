var service;
var myFunction = function() {};

module('Service Tests', {
  setup: function() {
    service = new SocketService();
  }
});

test('Initialization is done correctly', function(){
  deepEqual(service.list, {}, 'the services list is set to an empty object after initialization');
});

test('observe method works', function(){
  service.observe('testNamespace', myFunction, null);

  equal(service.list.testNamespace.length, 1, 'the testNamespace has an element in it');
  deepEqual(service.list.testNamespace[0].callback, myFunction, 'the element in testNamespace has the correct callback');

  equal(service.observe('testNamespace', 1, null), false, 'when adding an observer with a non function callback then the observe method returns false');
  equal(service.list.testNamespace.length, 1, 'the testNamespace has only 1 element and not 2');
});

test('clearAll method works', function(){
  service.observe('testNamespace', myFunction, null);
  service.observe('testNamespace', myFunction, null);
  service.observe('fooNamespace', myFunction, null);

  equal(service.list.testNamespace.length, 2, 'the testNamespace has 2 elements in it');
  equal(service.list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

  service.clearAll('testNamespace');

  equal(service.list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
  equal(service.list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

  service.clearAll('fooNamespace');

  equal(service.list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
  equal(service.list.fooNamespace.length, 0, 'the fooNamespace has 0 elements in it');

  equal(service.clearAll(), false, 'Calling clearAll with no namespace will return false');
});

asyncTest('notify method works', function() {
  var sampleData = {
    foo: 'bar'
  };
  var testFunciton = function() {
    ok(true, 'The test function was called');
  };
  var fooFunciton = function(fooData) {
    ok(true, 'The foo function was called');
    deepEqual(sampleData, fooData, 'Arguments are correctly passed to observers');
    start();
  };

  expect(4);

  service.observe('testNamespace', testFunciton, null);
  service.notify('testNamespace');

  service.observe('fooNamespace', fooFunciton, null);
  service.notify('fooNamespace', sampleData);

  equal(service.notify('barNamespace'), false, 'trying to notify on a namespace that has not been initialized will return false');
});
