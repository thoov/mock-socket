class ChatApp {
  constructor() {
    this.output = document.getElementById('output');

    this.websocket = new WebSocket('ws://echo.websocket.org/');
    this.websocket.onopen = evt => this.onopen(evt);
    this.websocket.onclose = evt => this.onclose(evt);
    this.websocket.onmessage = evt => this.onmessage(evt);
    this.websocket.onerror = evt => this.onerror(evt);
  }

  onopen() {
    this.writeToScreen('CONNECTED');
    this.doSend('WebSocket rocks');
  }

  onclose() {
    this.writeToScreen('DISCONNECTED');
  }

  onmessage(evt) {
    this.writeToScreen(`<span style="color: blue;">RESPONSE: ${evt.data}</span>`);
    this.websocket.close();
  }

  onerror(evt) {
    this.writeToScreen(`<span style="color: red;">ERROR:</span> ${evt.data}`);
  }

  doSend(message) {
    this.writeToScreen(`SENT: ${message}`);
    this.websocket.send(message);
  }

  writeToScreen(message) {
    const pre = document.createElement('p');
    pre.style.wordWrap = 'break-word';
    pre.innerHTML = message;
    this.output.appendChild(pre);
  }
}
