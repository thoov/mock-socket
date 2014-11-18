(function(){
    function Protocol(server) {
        this.subject = new Subject();
        this.mockServer = server;
        this.subject.observe('mockPartyJoined', this.mockPartyJoined, this);

        // TODO: Figure out if this is how we want to do this.
        MockSocks.PROTOCOL = this;
    }

    Protocol.prototype = {
        clientOnOpen: function(callback, client) {
            this.subject.observe('onopen', callback, client);
            this.subject.notify('mockPartyJoined');
        },

        clientSend: function(client, data) {
            this.subject.notify('server_onmessage', data);
        },

        clientClose: function(client) {
            this.subject.notify('server_onclose');
        },

        serverSend: function(server, data) {
            this.subject.notify('client_onmessage', data);
        },

        mockPartyJoined: function() {
            if(this.mockServer) {
                // if the server is online then whenever we get a new client just notify them via onopen
                // then remove them from onopen
                this.subject.notify('onopen');
                this.subject.notify('server_onconnection', this.mockServer);
                this.subject.clearAll('onopen');
            }
        }
    };

    window.Protocol = Protocol;
})();
