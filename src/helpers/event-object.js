function NodeEvent(config) {
  const event = {
    bubbles: false,
    cancelBublle: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    path: [],
    returnValue: true,
    timeStamp: Date.now(),
    type: config.type,
    lastEventId: '',
  };

  Object.keys(event).forEach(keyName => {
    this[keyName] = event[keyName];
  });
}

export default NodeEvent;
