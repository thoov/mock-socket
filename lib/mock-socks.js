(function(undefined){

	function MockSocks(url, protocol) {
		this.readyState = MockSocks.CONNECTING;
		this.url = url;
		this.binaryType = 'blob';
		this.protocol = protocol;
	}

	MockSocks.CONNECTING = 0;
	MockSocks.OPEN = 1;
	MockSocks.CLOSING = 2;
	MockSocks.LOADING = 3;
	MockSocks.CLOSED = 4;

	MockSocks.prototype = {

		_onopen: null,
		onopen: function(callback) {
			this._onopen = callback;
			this.protocol.clientOnOpen(this);
		},

		_onmessage: null,
		onmessage: function(callback) {
			this._onmessage = callback;
			this.protocol.clientOnMessage(this);
		},

		send: function(data) {
			this.protocol.clientSend(this, data);
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
