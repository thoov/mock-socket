(function(){
	function MockSocks(url) {

		if(!MockSocks.PROTOCOL) {
			console.log('MockSocks could not find the MockSocksServer. ' +
						'Make sure that you create a MockSocksServer object before creating a MockSocks object.');
			return false;
		}

		this.url = url;
		this.binaryType = 'blob';
		this.protocol = MockSocks.PROTOCOL;
		this.readyState = MockSocks.CONNECTING;
	}

	MockSocks.PROTOCOL = null;
	MockSocks.CONNECTING = 0;
	MockSocks.OPEN = 1;
	MockSocks.CLOSING = 2;
	MockSocks.LOADING = 3;
	MockSocks.CLOSED = 4;

	MockSocks.prototype = {
		onopen: function(callback) {
			this._onopen = callback;
			this.protocol.clientOnOpen(callback, this);
		},

		onmessage: function(callback) {
			this.protocol.subject.observe('client_onmessage', callback, this);
		},

		onclose: function(callback) {
			this.protocol.subject.observe('client_onclose', callback, this);
		},

		onerror: function(callback) {
			this.protocol.subject.observe('client_onerror', callback, this);
		},

		send: function(data) {
			this.protocol.clientSend(this, data);
		},

		close: function() {
			this.protocol.clientClose(this);
		}
	};

	window.MockSocks = MockSocks;
})();
