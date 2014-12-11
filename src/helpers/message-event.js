/*
* This is a mock websocket event message that is passed into the onopen,
* opmessage, etc functions.
*
* @param {name: string} The name of the event
* @param {data: *} The data to send.
* @param {origin: string} The url of the place where the event is originating.
*/
function socketEventMessage(name, data, origin) {
	var bubbles 				= false;
	var cancelable 			= false;
	var lastEventId 		= null;
	var source					= null;
	var ports 					= null;
	var sourcePlacehold = null;

	try {
		var messageEvent = new MessageEvent(name);
		messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId, source, ports);

		Object.defineProperties(messageEvent, {
			source:  {
				get: function() { return sourcePlacehold; },
				set: function(value) { sourcePlacehold = value; }
			},
			srcElement: {
				get: function() { return this.source; }
			},
			currentTarget: {
				get: function() { return this.source; }
			}
		});
	}
	catch (e) {
		// We are unable to create a MessageEvent Object. This should only be happening in PhantomJS.
		var messageEvent = {
			bubbles: bubbles,
			cancelable: cancelable,
			data: data,
			origin: origin,
			lastEventId: lastEventId,
			source: source,
			ports: ports
		};

		Object.defineProperties(messageEvent, {
			source:  {
				get: function() { return sourcePlacehold; },
				set: function(value) { sourcePlacehold = value; }
			},
			srcElement: {
				get: function() { return this.source; }
			},
			currentTarget: {
				get: function() { return this.source; }
			}
		});
	}

	return messageEvent;
}

module.exports = socketEventMessage;
