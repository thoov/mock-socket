function webSocketMessage(data, url) {
  var message = new window.MessageEvent('message');

  Object.defineProperties(message, {
    currentTarget: {
      get: function() {
        return {url: url};
      }
    },
    data: {
      value: data || null
    }
  });

  return message;
};

module.exports = webSocketMessage;
