/*
* This is a mock websocket event message that is passed into the onopen,
* opmessage, etc functions.
*
* @param {name: string} The name of the event
* @param {data: *} The data to send.
* @param {origin: string} The url of the place where the event is originating.
*/
function socketEventMessage(name, data, origin) {
	var bubbles 		= false;
	var cancelable 		= false;
	var lastEventId 	= null;
	var source			= null;
	var ports 			= null;
	var sourcePlacehold = null;
	var messageEvent 	= new window.MessageEvent(name);
	messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId, source, ports);

	Object.defineProperties(messageEvent, {
		source:  {
			get: function() { return sourcePlacehold; },
			set: function(value) { sourcePlacehold = value; }
		},
		srcElement: {
			get: function() { return messageEvent.source; }
		},
		currentTarget: {
			get: function() { return messageEvent.source; }
		}
	});

	return messageEvent;
}

module.exports = socketEventMessage;
