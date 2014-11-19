var subject;
var myFunction = function() {};

module('Subject Tests', {
	setup: function() {
		subject = new Subject();
	}
});

test('Initialization is done correctly', function(){
	deepEqual(subject._list, {}, 'the subjects list is set to an empty object after initialization');
});

test('observe method works', function(){
	subject.observe('testNamespace', myFunction, null);

	equal(subject._list.testNamespace.length, 1, 'the testNamespace has an element in it');
	deepEqual(subject._list.testNamespace[0].callback, myFunction, 'the element in testNamespace has the correct callback');

	equal(subject.observe('testNamespace', 1, null), false, 'when adding an observer with a non function callback then the observe method returns false');
	equal(subject._list.testNamespace.length, 1, 'the testNamespace has only 1 element and not 2');
});

test('clearAll method works', function(){
	subject.observe('testNamespace', myFunction, null);
	subject.observe('testNamespace', myFunction, null);
	subject.observe('fooNamespace', myFunction, null);

	equal(subject._list.testNamespace.length, 2, 'the testNamespace has 2 elements in it');
	equal(subject._list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

	subject.clearAll('testNamespace');

	equal(subject._list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
	equal(subject._list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

	subject.clearAll('fooNamespace');

	equal(subject._list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
	equal(subject._list.fooNamespace.length, 0, 'the fooNamespace has 0 elements in it');

	equal(subject.clearAll(), false, 'Calling clearAll with no namespace will return false');
});

asyncTest('notify method works', function(){
	var sampleData = {foo: 'bar'};

	var testFunciton = function() {
		ok(true, 'The test function was called');
		start();
	};

	var fooFunciton = function(fooData) {
		ok(true, 'The foo function was called');
		deepEqual(sampleData, fooData, 'Arguments are correctly passed to observers');
		start();
	};

	subject.observe('testNamespace', testFunciton, null);
	subject.notify('testNamespace');

	stop();
	subject.observe('fooNamespace', fooFunciton, null);
	subject.notify('fooNamespace', sampleData);


	equal(subject.notify('barNamespace'), false, 'trying to notify on a namespace that has not been initialized will return false');
});
