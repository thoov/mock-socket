(function(){
	function MockSocksServer() {
		this.protocol = new Protocol(this);
	}

	MockSocksServer.prototype = {
		on: function(type, callback) {
			var observerKey;

			switch(type) {
				case 'connection':
					observerKey = 'clientHasJoined';
					break;
				case 'message':
					observerKey = 'clientHasSentMessage';
					break;
				case 'error':
					observerKey = 'serverErrorHasOccuresd';
					break;
				case 'close':
					observerKey = 'clientHasLeft';
					break;
			}

			this.protocol.subject.observe(observerKey, callback, this);
		},

		send: function(data) {
			this.protocol.subject.notify('clientOnMessage', data);
		}
	};

	window.MockSocksServer = MockSocksServer;
})();
