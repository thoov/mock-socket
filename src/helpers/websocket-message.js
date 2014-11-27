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
