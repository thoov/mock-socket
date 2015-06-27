import QUnit from 'qunit';

var service;
var blankFunction = function() {};

QUnit.module('Service Tests', {
  setup: function() {
    service = new SocketService();
  }
});

QUnit.test('Initialization is done correctly', function(assert) {
  assert.deepEqual(service.list, {}, 'the services list is set to an empty object after initialization');
});

QUnit.test('observe method works', function(assert) {
  service.observe('testNamespace', blankFunction, null);

  assert.equal(service.list.testNamespace.length, 1, 'the testNamespace has an element in it');
  assert.deepEqual(service.list.testNamespace[0].callback, blankFunction, 'the element in testNamespace has the correct callback');

  assert.equal(service.observe('testNamespace', 1, null), false, 'when adding an observer with a non function callback then the observe method returns false');
  assert.equal(service.list.testNamespace.length, 1, 'the testNamespace has only 1 element and not 2');
});

QUnit.test('clearAll method works', function(assert) {
  service.observe('testNamespace', blankFunction, null);
  service.observe('testNamespace', blankFunction, null);
  service.observe('fooNamespace', blankFunction, null);

  assert.equal(service.list.testNamespace.length, 2, 'the testNamespace has 2 elements in it');
  assert.equal(service.list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

  service.clearAll('testNamespace');

  assert.equal(service.list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
  assert.equal(service.list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

  service.clearAll('fooNamespace');

  assert.equal(service.list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
  assert.equal(service.list.fooNamespace.length, 0, 'the fooNamespace has 0 elements in it');

  assert.equal(service.clearAll(), false, 'Calling clearAll with no namespace will return false');
});

QUnit.asyncTest('notify method works', function(assert) {
  var sampleData = {
    foo: 'bar'
  };
  var testFunciton = function() {
    assert.ok(true, 'The test function was called');
  };
  var fooFunciton = function(fooData) {
    assert.ok(true, 'The foo function was called');
    assert.deepEqual(sampleData, fooData, 'Arguments are correctly passed to observers');
    assert.start();
  };

  assert.expect(4);

  service.observe('testNamespace', testFunciton, null);
  service.notify('testNamespace');

  service.observe('fooNamespace', fooFunciton, null);
  service.notify('fooNamespace', sampleData);

  assert.equal(service.notify('barNamespace'), false, 'trying to notify on a namespace that has not been initialized will return false');
});
