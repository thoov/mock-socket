(function(){
	function Protocol(server) {
		this.subject = new Subject();
		this.mockServer = server;
		this.subject.observe('clientHasConnected', this.clientHasConnected, this);

		// TODO: Figure out if this is how we want to do this.
		MockSocks.PROTOCOL = this;
	}

	Protocol.prototype = {
		clientHasConnected: function() {
			// If the server is not ready and the client tries to connect this results in a the onerror method
			// being invoked.
			if(!this.mockServer) {
				this.subject.notify('updateReadyState', MockSocks.CLOSED);
				this.subject.notify('clientOnError');
				return false;
			}

			this.subject.notify('updateReadyState', MockSocks.OPEN);
			this.subject.notify('clientOnOpen'); // Fire the clients onopen function
			this.subject.notify('clientHasJoined', this.mockServer); // Fire the server's on connection method
			this.subject.clearAll('clientOnOpen'); // Remove the clients onopen function from being called again
		}
	};

	window.Protocol = Protocol;
})();
