// Type definitions for Mock Socket 8.X+
// Project: Mock Socket
// Definitions by: Travis Hoover <https://github.com/thoov/mock-socket>

declare module 'mock-socket' {
  class EventTarget {
    listeners: any;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    dispatchEvent(evt: Event): boolean;
    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
  }

  //
  // https://html.spec.whatwg.org/multipage/web-sockets.html#websocket
  //
  class WebSocket extends EventTarget {
    constructor(url?: USVString, protocols?: string|string[]);

    readonly url: USVString;

    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
    readonly readyState: number;
    readonly bufferedAmount: number;

    onopen: EventHandlerNonNull;
    onerror: EventHandlerNonNull;
    onclose: EventHandlerNonNull;
    readonly extensions: string;
    readonly protocol: string;
    close(code?: number, reason?: string): void;

    onmessage: EventHandlerNonNull;
    binaryType: BinaryType;
    send(data: USVString | Blob | ArrayBuffer | ArrayBufferView): void;
  }

  class Server extends EventTarget {
    constructor(url: USVString, options?: ServerOptions);

    readonly options?: ServerOptions;

    start(): void;
    stop(callback?: () => void): void;

    on(type: string, callback: (socket: WebSocket) => void): void;
    close(options?: CloseOptions): void;
    emit(event: string, data: any, options?: EmitOptions): void;

    clients(): WebSocket[];
    to(room: any, broadcaster: any, broadcastList?: object): ToReturnObject;
    in(any: any): ToReturnObject;
    simulate(event: Event): void;

    public of(url: USVString): Server;
  }

  interface CloseOptions {
    code: number;
    reason: string;
    wasClean: boolean;
  }

  interface EmitOptions {
    websockets: WebSocket[];
  }

  interface ToReturnObject {
    to: (chainedRoom: any, chainedBroadcaster: any) => ToReturnObject;
    emit(event: Event, data: any): void;
  }

  interface ServerOptions {
    verifyClient: () => any;
    selectProtocol: () => any;
  }
}
