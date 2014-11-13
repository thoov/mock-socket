describe('basic setup', function(){
    it('should have the correct initial properties', function(){
        var exampleSocket = new MockSock("ws://www.example.com/socketserver");
        expect(exampleSocket.url).toBe("ws://www.example.com/socketserver");
        expect(exampleSocket.readyState).toBe(MockSock.CONNECTING);
    });
});
