(function(){
	function MockSocks(url) {

		if(!MockSocks.PROTOCOL) {
			console.log('MockSocks could not find the MockSocksServer. ' +
						'Make sure that you create a MockSocksServer object before creating a MockSocks object.');
			return false;
		}

		this.url = url + '/';
		this.binaryType = 'blob';
		this.protocol = MockSocks.PROTOCOL;
		this.readyState = MockSocks.CONNECTING;

		Object.defineProperties(this, {
			'onopen': {
				configurable: true,
				enumerable: true,
				get: function() {
					return this._onopen;
				},
				set: function(callback) {
					this.protocol.clientOnOpen(callback, this);
					this._onopen = callback;
				}
			},
			'onmessage': {
				configurable: true,
				enumerable: true,
				get: function() {
					return this._onmessage;
				},
				set: function(callback) {
					this.protocol.subject.observe('client_onmessage', callback, this);
					this._onmessage = callback;
				}
			},
			'onclose': {
				configurable: true,
				enumerable: true,
				get: function() {
					return this._onmessage;
				},
				set: function(callback) {
					this.protocol.subject.observe('client_onclose', callback, this);
					this._onmessage = callback;
				}
			},
			'onerror': {
				configurable: true,
				enumerable: true,
				get: function() {
					return this._onmessage;
				},
				set: function(callback) {
					this.protocol.subject.observe('client_onerror', callback, this);
					this._onmessage = callback;
				}
			}
		});
	}

	MockSocks.PROTOCOL = null;
	MockSocks.CONNECTING = 0;
	MockSocks.OPEN = 1;
	MockSocks.CLOSING = 2;
	MockSocks.LOADING = 3;
	MockSocks.CLOSED = 4;

	MockSocks.prototype = {
		_onopen: null,
		_onmessage: null,
		_onclose: null,
		_onerror: null,

		send: function(data) {
			this.protocol.clientSend(this, data);
		},

		close: function() {
			this.protocol.clientClose(this);
		},

		_updateReadyState: function(newReadyState) {
			this.readyState = newReadyState;
		}
	};

	window.MockSocks = MockSocks;
})();
