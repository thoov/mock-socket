function Subject() {
  this._list = {};
}

Subject.prototype = {
  observe: function(namespace, callback, context) {
    if(!this._list[namespace]) {
      this._list[namespace] = [];
    }

    if(typeof callback !== 'function') {
      console.log('The callback which is trying to observe namespace: ' + namespace + ' is not a function.');
      return false;
    }

    this._list[namespace].push({callback: callback, context: context});
  },

  unobserve: function(namespace, obj) {
    for (var i = 0, len = this._list[namespace].length; i < len; i++) {
      if (this._list[namespace][i] === obj) {
        this._list[namespace].splice(i, 1);
        return true;
      }
    }

    return false;
  },

  clearAll: function(namespace) {

    if(typeof namespace !== 'string') {
      console.log('A valid namespace must be passed into clearAll.');
      return false;
    }

    this._list[namespace] = [];
  },

  notify: function(namespace) {
    var args = Array.prototype.slice.call(arguments, 1); // This strips the namespace from the list of args

    if(!this._list[namespace]) {
      console.log('Trying to notify on namespace: ' + namespace + ' but an observer has never been added to it.');
      return false;
    }

    for (var i = 0, len = this._list[namespace].length; i < len; i++) {

      if(typeof this._list[namespace][i].callback !== 'function') {
        console.log('An observer for the namespace: ' + namespace + ' is not a function.');
        continue;
      }

      this._list[namespace][i].callback.apply(this._list[namespace][i].context, args);
    }
  }
};

module.exports = Subject;
