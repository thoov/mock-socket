module('Issue #18: Multiple sockets share connection');
asyncTest('msgs only sent from the server to single mock-socket', function() {
	var socketUrl = 'ws://localhost:8080';
	var server = new MockServer(socketUrl);
	var dataA = 'foo';
	var dataB = 'bar';
	var socketA = new MockSocket(socketUrl);
	var socketB = new MockSocket(socketUrl);

	expect(2);

	var connectionCount = 0;
	server.on('connection', function(conn) {
		if (connectionCount === 0) {
			conn.send(dataA);
		} else {
			conn.send(dataB);
		}
		connectionCount++;
	});

	socketA.onopen = function() {
		socketA.send("hello");
	};
	socketA.onmessage = function(e) {
		equal(e.data, dataA);
	};

	socketB.onmessage = function(e) {
		equal(e.data, dataB);
	};
	setTimeout(function() {
		start();
	}, 500)
});

asyncTest('msgs can be broadcasted', function() {
	var socketUrl = 'ws://localhost:8080';
	var server = new MockServer(socketUrl);
	var dataA = 'foo';
	var socketA = new MockSocket(socketUrl);
	var socketB = new MockSocket(socketUrl);

	expect(2);
	server.broadcast = function(data) {
		for (var i in this.clients)
			this.clients[i].send(data);
	}
	var connectionCount = 0;
	server.on('connection', function(conn) {
		if (connectionCount === 0) {
		} else {
			server.broadcast(dataA);
		}
		connectionCount++;
	});

	socketA.onmessage = function(e) {
		equal(e.data, dataA);
	};

	socketB.onmessage = function(e) {
		equal(e.data, dataA);
	};
	setTimeout(function() {
		start();
	}, 500)
});