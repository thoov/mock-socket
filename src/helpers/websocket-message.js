/**
* This is a mock websocket event message that is passed into the onopen, opmessage, ...
* functions.
*
* TODO: Fill out this object to be more inline with the actual event object.
*
* @param {data: *} The data to send.
* @param {url: string} The url of the place where the event is originating.
*/
function webSocketMessage(data, url) {
  var message = {
    currentTarget: {
      url: url
    },
    data: data
  };

  return message;
};

module.exports = webSocketMessage;
