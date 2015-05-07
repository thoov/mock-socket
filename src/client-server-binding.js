var socketMessageEvent = require('./helpers/message-event');
var delay = require('./helpers/delay');
function ClientServerBinding(client, server) {
		this.send = function(msg) {
		delay(function() {
			if (client.onmessage) {
				client.onmessage(socketMessageEvent('message', msg, server.url));
			}
		}, this)
	}

	this.on = function(type, callback) {
		server.on.call(server, type, callback)
	}

	this.close = function() {
		server.close.call(server)
	}
}

module.exports = ClientServerBinding