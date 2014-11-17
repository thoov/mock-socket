(function(){
	function MockSocksServer() {
		var protocol = new Protocol();
		this.protocol = protocol;
		protocol.addServer(this);
	}

	MockSocksServer.prototype = {
		_onclose: null,
		_onerror: null,
		_onmessage: null,
		_onconnection: null,

		on: function(type, callback) {
			// This turns a type such as 'connection' to '_onconnection'
			this['_on' + type] = callback;

			switch(type) {
				case 'connection':
					this.protocol.serverOnConnection(this);
					break;
				case 'message':
					this.protocol.serverOnMessage(this);
					break;
				case 'close':
					this.protocol.serverOnClose(this);
					break;
				case 'error':
					this.protocol.serverOnError(this);
					break;
			}
		},

		send: function(data) {
			this.protocol.serverSend(this, data);
		}
	};

	window.MockSocksServer = MockSocksServer;
})();
