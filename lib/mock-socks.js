(function(undefined){

	function MockSocks(url) {
		this.readyState = MockSocks.CONNECTING;
		this.url = url;
		this.binaryType = 'blob';
		this.bufferedAmount = 0;
		this.extensions = '';
	  	this.protocol = '';
	}

	MockSocks.CONNECTING = 0;
	MockSocks.OPEN = 1;
	MockSocks.CLOSING = 2;
	MockSocks.LOADING = 3;
	MockSocks.CLOSED = 4;

	MockSocks.prototype = {
		sendListeners: [],
		closeListeners: [],
		errorListeners: [],

		onopenListeners: [],
		onopen: function(callback) {
			this.onopenListeners.push(callback);
		},

		onmessage: function() {

		},

		onerror: function() {

		},

		onclose: function(type, callback) {

		},

		send: function(data) {
			this.sendListeners.forEach(function(i) {
				i.call(null, data);
			});
		},

		close: function() {

		}
	};


	if (typeof module !== 'undefined' && module.exports) {
		module.exports = MockSocks;
	}
	else if (typeof define === 'function' && define.amd) {
		define(function() { return MockSocks; });
	}
	else if (typeof window !== 'undefined') {
		window.MockSocks = MockSocks;
	}
	else if (this) {
		this.MockSocks = MockSocks;
	}
})();
