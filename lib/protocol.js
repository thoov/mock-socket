(function(undefined){

    function Protocol() {
        this.subject = new Subject();
        this.subject.observe('mockPartyJoined', this.mockPartyJoined, this);
    }

    Protocol.prototype = {
        mockServer: null,

        clientOnOpen: function(client) {
            this.subject.observe('onopen', client._onopen, client);
            this.subject.notify('mockPartyJoined');
        },

        addServer: function(server) {
            this.mockServer = server;
            this.subject.notify('mockPartyJoined');
        },

        serverOnConnection: function(server) {
            this.subject.observe('onconnection', server._onconnection, server);
        },


        mockPartyJoined: function() {

            if(this.mockServer) {
                // if the server is online then when ever we get a new client just notify them the onopen.
                // then remove them from the onopen
                this.subject.notify('onopen');
                this.subject.notify('onconnection');
                this.subject.clearAll('onopen');

            }
        }


    };


    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Protocol;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function() { return Protocol; });
    }
    else if (typeof window !== 'undefined') {
        window.Protocol = Protocol;
    }
    else if (this) {
        this.Protocol = Protocol;
    }
})();
