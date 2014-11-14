(function(undefined){

	function MockSocksServer(protocol) {
		this.protocol = protocol;
		protocol.addServer(this);
	}

	MockSocksServer.prototype = {
		_onmessage: null,
		_onconnection: null,

		on: function(type, callback) {
			switch(type) {
				case 'connection':
					this._onconnection = callback;
					this.protocol.serverOnConnection(this);
					break;
				case 'message':
					this._onmessage = callback;
					this.protocol.serverOnMessage(this);
					break;
			}
		},

		send: function(data) {
			this.protocol.serverSend(this, data);
		}
	};


	if (typeof module !== 'undefined' && module.exports) {
		module.exports = MockSocksServer;
	}
	else if (typeof define === 'function' && define.amd) {
		define(function() { return MockSocksServer; });
	}
	else if (typeof window !== 'undefined') {
		window.MockSocksServer = MockSocksServer;
	}
	else if (this) {
		this.MockSocksServer = MockSocksServer;
	}
})();
