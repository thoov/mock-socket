(function(undefined){

	function MockSocksServer(protocol) {
		this.protocol = protocol;
		protocol.addServer(this);
	}

	MockSocksServer.prototype = {

		_onconnection: null,
		on: function(type, callback) {
			switch(type) {
				case 'connection':
					this._onconnection = callback;
					this.protocol.serverOnConnection(this);
					break;
			}
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
