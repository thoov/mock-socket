(function(undefined){

    function Protocol() {
        this.subject = new Subject();
        this.mockServer = null;
        this.subject.observe('mockPartyJoined', this.mockPartyJoined, this);
    }

    Protocol.prototype = {
        /*
            Client Methods
        */
        clientOnOpen: function(client) {
            this.subject.observe('onopen', client._onopen, client);
            this.subject.notify('mockPartyJoined');
        },

        clientOnMessage: function(client) {
            this.subject.observe('client_onmessage', client._onmessage, client);
        },

        clientOnError: function(client) {
            this.subject.observe('onerror', client._onerror, client);
        },

        clientOnClose: function(client) {
            this.subject.observe('onclose', client._onclose, client);
        },

        clientSend: function(client, data) {
            this.subject.notify('server_onmessage', data);
        },

        clientClose: function(client) {
            this.subject.notify('server_onclose');
        },


        /*
            Server Methods
        */
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

        serverOnClose: function(server) {
            this.subject.observe('server_onclose', server._onclose, server);
        },

        serverOnError: function(server) {
            this.subject.observe('server_onerror', server._onerror, server);
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
