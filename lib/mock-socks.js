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
					// TODO: this is a hack
					//this.protocol.subject.observe('clientOnOpen', callback, this);
					//this.protocol.subject.notify('clientOnOpen');
					if(this.readyState === MockSocks.OPEN) {
						callback.call(this);
						this._onopen = callback;
					}
				}
			},
			'onmessage': {
				configurable: true,
				enumerable: true,
				get: function() {
					return this._onmessage;
				},
				set: function(callback) {
					this.protocol.subject.observe('clientOnMessage', callback, this);
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
					this.protocol.subject.observe('clientOnClose', callback, this);
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
					this.protocol.subject.observe('clientOnError', callback, this);
					this._onmessage = callback;
				}
			}
		});

		// This is purely setup and just to create the initial observer.
		this.protocol.subject.observe('updateReadyState', this._updateReadyState, this);

		// This tells the protocol that the client has been created.
		this.protocol.subject.notify('clientHasConnected');
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
			this.protocol.subject.notify('clientHasSentMessage', data);
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
