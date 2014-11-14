(function(undefined){

	function MockSocks(url, protocol) {
		this.url = url;
		this.binaryType = 'blob';
		this.protocol = protocol;
		this.readyState = MockSocks.CONNECTING;
	}

	MockSocks.CONNECTING = 0;
	MockSocks.OPEN = 1;
	MockSocks.CLOSING = 2;
	MockSocks.LOADING = 3;
	MockSocks.CLOSED = 4;

	MockSocks.prototype = {
		_onopen: null,
		_onclose: null,
		_onerror: null,
		_onmessage: null,

		onopen: function(callback) {
			this._onopen = callback;
			this.protocol.clientOnOpen(this);
		},

		onmessage: function(callback) {
			this._onmessage = callback;
			this.protocol.clientOnMessage(this);
		},

		onclose: function(callback) {
			this._onclose = callback;
			this.protocol.clientOnClose(this);
		},

		onerror: function(callback) {
			this._onerror = callback;
			this.protocol.clientOnError(this);
		},

		send: function(data) {
			this.protocol.clientSend(this, data);
		},

		close: function() {
			this.protocol.clientClose(this);
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
