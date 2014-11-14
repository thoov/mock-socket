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

        clientOnMessage: function(client) {
            this.subject.observe('client_onmessage', client._onmessage, client);
        },

        clientSend: function(client, data) {
            this.subject.notify('server_onmessage', data);
        },

        addServer: function(server) {
            this.mockServer = server;
            this.subject.notify('mockPartyJoined');
        },

        serverOnConnection: function(server) {
            this.subject.observe('onconnection', server._onconnection, server);
        },
        serverOnMessage: function(server) {
            this.subject.observe('server_onmessage', server._onmessage, server);
        },

        serverSend: function(server, data) {
            this.subject.notify('client_onmessage', data);
        },

        mockPartyJoined: function() {
            if(this.mockServer) {
                // if the server is online then whenever we get a new client just notify them via onopen
                // then remove them from onopen
                this.subject.notify('onopen');
                this.subject.notify('onconnection', this.mockServer);
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
