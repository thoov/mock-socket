/*
*
*/
class EventTarget {

  constructor() {
    this.listeners = {};
  }

  addEventListener(eventName, callback) {
    if(typeof callback === 'function') {
      this.listeners[eventName] = callback;
    }
  }

  removeEventListener(eventName) {
    this.listeners[eventName] = null;
  }

  dispatchEvent(event, customArgument) {
    var eventName = event.type;
    var callback  = this.listeners[eventName];

    if(!callback) {
      return false;
    }

    if(customArgument) {
      callback.call(null, customArgument);
    }
    else {
      callback.call(null, event);
    }
  }
}

export default EventTarget;
