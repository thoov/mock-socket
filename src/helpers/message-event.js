/*
* This is a mock websocket event message that is passed into the onopen,
* opmessage, etc functions.
*
* @param {name: string} The name of the event
* @param {data: *} The data to send.
* @param {origin: string} The url of the place where the event is originating.
*/
function socketEventMessage(name, data, origin) {
	var ports           = null;
	var source          = null;
	var bubbles         = false;
	var cancelable      = false;
	var lastEventId     = '';
	var targetPlacehold = null;

	try {
		var messageEvent = new MessageEvent(name);
		messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId);

		Object.defineProperties(messageEvent, {
			target:  {
				get: function() { return targetPlacehold; },
				set: function(value) { targetPlacehold = value; }
			},
			srcElement: {
				get: function() { return this.target; }
			},
			currentTarget: {
				get: function() { return this.target; }
			}
		});
	}
	catch (e) {
		// We are unable to create a MessageEvent Object. This should only be happening in PhantomJS.
		var messageEvent = {
			type             : name,
			bubbles          : bubbles,
			cancelable       : cancelable,
			data             : data,
			origin           : origin,
			lastEventId      : lastEventId,
			source           : source,
			ports            : ports,
			defaultPrevented : false,
			returnValue      : true,
			clipboardData    : undefined
		};

		Object.defineProperties(messageEvent, {
			target:  {
				get: function() { return targetPlacehold; },
				set: function(value) { targetPlacehold = value; }
			},
			srcElement: {
				get: function() { return this.target; }
			},
			currentTarget: {
				get: function() { return this.target; }
			}
		});
	}

	return messageEvent;
}

module.exports = socketEventMessage;
