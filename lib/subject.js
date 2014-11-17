(function(undefined){

    /*
        Based off of the observer pattern here: https://carldanley.com/js-observer-pattern/
    */
    function Subject() {
      this._list = {};
    }

    Subject.prototype = {
        observe: function(namespace, obj, context) {
            if(this._list[namespace]) {
                this._list[namespace].push({callback: obj, context: context});
            }
            else {
                this._list[namespace] = [{callback: obj, context: context}];
            }
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
            this._list[namespace] = [];
        },

        notify: function(namespace) {
            var args = Array.prototype.slice.call(arguments, 1);

            if(this._list[namespace]) {
                for (var i = 0, len = this._list[namespace].length; i < len; i++) {
                    this._list[namespace][i].callback.apply(this._list[namespace][i].context, args);
                }
            }
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Subject;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function() { return Subject; });
    }
    else if (typeof window !== 'undefined') {
        window.Subject = Subject;
    }
    else if (this) {
        this.Subject = Subject;
    }
})();
