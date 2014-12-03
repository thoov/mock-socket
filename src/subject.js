function Subject() {
  this.list = {};
}

Subject.prototype = {

  /**
  * Binds a callback to a namespace. If notify is called on a namespace all "observers" will be
  * fired with the context that is passed in.
  *
  * @param {namespace: string}
  * @param {namespace: function}
  * @param {namespace: object}
  */
  observe: function(namespace, callback, context) {

    // Make sure the arguments are of the correct type
    if( typeof namespace !== 'string' || typeof callback !== 'function' || (context && typeof context !== 'object')) {
      return false;
    }

    // If a namespace has not been created before then we need to "initialize" the namespace
    if(!this.list[namespace]) {
      this.list[namespace] = [];
    }

    this.list[namespace].push({callback: callback, context: context});
  },

  /**
  * TODO: Fix this
  */
  unobserve: function(namespace, obj) {
    for (var i = 0, len = this.list[namespace].length; i < len; i++) {
      if (this.list[namespace][i] === obj) {
        this.list[namespace].splice(i, 1);
        return true;
      }
    }

    return false;
  },

  /**
  * Remove all observers from a given namespace.
  *
  * @param {namespace: string} The namespace to clear.
  */
  clearAll: function(namespace) {

    if(typeof namespace !== 'string') {
      return false;
    }

    this.list[namespace] = [];
  },

  /**
  * Notify all callbacks that have been bound to the given namespace.
  *
  * @param {namespace: string} The namespace to notify observers on.
  */
  notify: function(namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

    if(typeof namespace !== 'string' || !this.list[namespace]) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for(var i = 0, len = this.list[namespace].length; i < len; i++) {
      this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
    }
  }
};

module.exports = Subject;
