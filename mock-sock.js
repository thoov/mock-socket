(function(){

	/*
	  Constructor for a fake window.XMLHttpRequest
	*/
	function MockSock(url) {
		this.readyState = MockSock.CONNECTING;
		this.url = url;
		this.binaryType = 'blob';
		this.bufferedAmount = 0;
		this.extensions = '';
	  	this.protocol = '';
	}


	// These status codes are available on the native XMLHttpRequest
	// object, so we match that here in case a library is relying on them.
	MockSock.CONNECTING = 0;
	MockSock.OPEN = 1;
	MockSock.CLOSING = 2;
	MockSock.LOADING = 3;
	MockSock.CLOSED = 4;

	MockSock.prototype = {

		onopen: function() {

		},

		onmessage: function() {

		},

		onerror: function() {

		},

		onclose: function(type, callback) {

		},

		send: function() {

		},

		close: function() {

		}
	};


	if (typeof module !== 'undefined' && module.exports) {
		module.exports = MockSock;
	}
	else if (typeof define === 'function' && define.amd) {
		define(function() { return MockSock; });
	}
	else if (typeof window !== 'undefined') {
		window.MockSock = MockSock;
	}
	else if (this) {
		this.MockSock = MockSock;
	}
})();
