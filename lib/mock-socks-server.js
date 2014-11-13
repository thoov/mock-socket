(function(undefined){

	function MockSocksServer(webSocket) {
		this.webSocket = webSocket;
	}

	MockSocksServer.prototype = {

		on: function(type, callback) {
			switch(type) {
				case 'message':
					this.webSocket.sendListeners.push(callback);
					break;
				case 'connection':
					if(this.webSocket) {
						this.webSocket.readyState = 1;
						for(var i = 0; i < this.webSocket.onopenListeners.length; i++) {
							this.webSocket.onopenListeners[i].call(null);
						}
						callback.call(null, this);
					}
					break;
			}
		},

		send: function(dataObject) {
			this.webSocket.onmessage.call(null, dataObejct);
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
