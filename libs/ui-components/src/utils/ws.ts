const createURL = (host: string, path: string): string => {
  let url = 'http://localhost:8080';

  //if (host === 'auto') {
  //  if (window.location.protocol === 'https:') {
  //    url = 'wss://';
  //  } else {
  //    url = 'ws://';
  //  }
  //  url += window.location.host;
  //} else {
  //  url = host;
  //}
  //
  //if (path) {
  //  url += path;
  //}

  return url;
};

export type WSOptions = {
  sessionid: string;
  deviceid: string;
  reconnect?: boolean;
  jsonParse?: boolean;
  bufferMax?: number;
  bufferFlushInterval?: number;
  timeout?: number;
};
type GenericHandler<T = any> = (data: T) => void;
export type OpenHandler = GenericHandler<undefined>; // nothing is sent
export type CloseHandler = GenericHandler<CloseEvent>;
export type ErrorHandler = GenericHandler<Event>;
/**
 * The WebSocket can send JSON that is parsed, or we just send it through as-is
 */
export type MessageDataType = object | any;
export type MessageHandler = GenericHandler<MessageDataType>;
/**
 * Data is provided potentially by .destroy() caller.
 */
export type DestroyHandler = GenericHandler<unknown | undefined>;
export type BulkMessageHandler = GenericHandler<MessageDataType>;

type WSHandlers = {
  open: OpenHandler[];
  close: CloseHandler[];
  error: ErrorHandler[];
  message: MessageHandler[];
  destroy: DestroyHandler[];
  bulkmessage: BulkMessageHandler[];
};
type WSHandlerType = keyof WSHandlers;
export class WSFactory {
  private ws!: WebSocket;
  public connected: boolean;
  private handlers: { [type: string]: GenericHandler[] } = {};
  private state: string = 'initial';
  constructor(
    private url: string,
    private options: WSOptions,
  ) {
    this.connected = false;
    fetch(this.url, {
      headers: {
        deviceid: this.options.deviceid,
        sessionid: this.options.sessionid,
      },
    }).then((response) => {
      const wsUrl = response.url.replace('http', 'ws');
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = this.onOpen;
      this.ws.onclose = this.onClose;
      this.ws.onerror = this.onError;
      this.ws.onmessage = this.onMessage;
    });
  }
  private registerHandler(type: WSHandlerType, handler: GenericHandler) {
    if (this.handlers[type]) {
      this.handlers[type].push(handler);
    } else {
      console.error(`Handler type ${type} does not exist in handlers`);
    }
  }
  private onOpen = () => {
    console.log('Connected to server');
    this.connected = true;
  };

  private onClose = () => {
    console.log('Disconnected from server');
    this.connected = false;
  };

  private onError = (error: Event) => {
    console.error('Error connecting to server', error);
  };

  private onMessage = (message: MessageEvent) => {
    console.log('Received message from server:\n', message.data);
  };

  public send = (message: string) => {
    this.ws.send(message);
  };

  public close = () => {
    this.ws.close();
  };
  onmessage(fn: MessageHandler) {
    this.registerHandler('message', fn);
  }

  public destroy = () => {
    this.ws.close();
  };
}
