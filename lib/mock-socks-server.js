(function(){
	function MockSocksServer() {
		this.protocol = new Protocol(this);
	}

	MockSocksServer.prototype = {
		_onclose: null,
		_onerror: null,
		_onmessage: null,
		_onconnection: null,

		on: function(type, callback) {
			// This turns a type such as 'connection' to 'server_onconnection'
			this.protocol.subject.observe('server_on' + type, callback, this);
		},

		send: function(data) {
			this.protocol.serverSend(this, data);
		}
	};

	window.MockSocksServer = MockSocksServer;
})();
