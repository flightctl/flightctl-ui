import * as React from 'react';
import { useAppContext } from './useAppContext';

const APP_CONSOLE_CLOSE_CODE = 1000;
const APP_CONSOLE_CLOSE_REASON = 'client disconnect';

/** WebSocket close code from the remote-access service when another client took over the session. */
const WS_CLOSE_SESSION_TAKEN_OVER = 4001;

/**
 * WebSocket close code from the remote-access service when the VM app has no active compute workload.
 * App is likely starting, stopping, or stopped.
 */
const WS_CLOSE_APP_NOT_READY = 4002;

/** HTTP status embedded in the WebSocket close reason when the console session is already in use. */
const HTTP_SESSION_IN_USE = 409;

/** HTTP status when the VM app console is temporarily unavailable. */
const HTTP_APP_NOT_READY = 503;

const isErrorCloseEvent = (evt: CloseEvent) => evt.code !== 1000 && evt.code !== 1001;

export type AppConsoleConnectError =
  | { kind: 'sessionInUse' | 'sessionTakenOver' | 'appNotReady' | 'forbidden' | 'notFound' | 'timeout' }
  | { kind: 'unknownError'; detail?: string };

const closeAppConsoleWebSocket = (ws: WebSocket) => {
  if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
    ws.close(APP_CONSOLE_CLOSE_CODE, APP_CONSOLE_CLOSE_REASON);
  }
};

/** Parses proxy close reasons of the form "<status> <optional detail>". */
export const parseCloseReason = (reason: string): { status?: number; detail?: string } => {
  const trimmed = reason.trim();
  const match = trimmed.match(/^(\d{3})(?:\s+(.*))?$/);
  if (!match) {
    return trimmed ? { detail: trimmed } : {};
  }
  const status = Number.parseInt(match[1], 10);
  const detail = match[2]?.trim();
  if (!detail) {
    return { status };
  }
  // Drop generic HTTP status text so callers can fall back to canned copy.
  const statusText = (
    {
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      502: 'Bad Gateway',
    } as Record<number, string>
  )[status];
  if (statusText && detail.toLowerCase() === statusText.toLowerCase()) {
    return { status };
  }
  return { status, detail };
};

const connectErrorFromCloseEvent = (evt: CloseEvent): AppConsoleConnectError => {
  if (evt.code === WS_CLOSE_SESSION_TAKEN_OVER) {
    return { kind: 'sessionTakenOver' };
  }
  if (evt.code === WS_CLOSE_APP_NOT_READY) {
    return { kind: 'appNotReady' };
  }
  // Fall back to HTTP status code if no WebSocket close code is present.
  const { status, detail } = parseCloseReason(evt.reason);
  switch (status) {
    case HTTP_SESSION_IN_USE:
      return { kind: 'sessionInUse' };
    case HTTP_APP_NOT_READY:
      return { kind: 'appNotReady' };
    case 403:
      return { kind: 'forbidden' };
    case 404:
      return { kind: 'notFound' };
    case 504:
      return { kind: 'timeout' };
    default:
      return { kind: 'unknownError', detail };
  }
};

const decodeMessageData = (data: ArrayBuffer | string): string => {
  if (typeof data === 'string') {
    return data;
  }
  return new TextDecoder().decode(data);
};

const decodeMessageDataAsync = async (data: Blob | ArrayBuffer | string): Promise<string> => {
  if (typeof data === 'string' || data instanceof ArrayBuffer) {
    return decodeMessageData(data);
  }
  return new TextDecoder().decode(new Uint8Array(await data.arrayBuffer()));
};

export const useAppConsoleWebSocket = (
  deviceId: string,
  appName: string,
  organizationId: string | undefined,
  onMsgReceived: (data: string) => Promise<void>,
): {
  sendMessage: (msg: string, resize?: boolean) => void;
  isConnecting: boolean;
  isClosed: boolean;
  error: AppConsoleConnectError | undefined;
  reconnect: (options?: { force?: boolean }) => void;
  disconnect: VoidFunction;
} => {
  const {
    fetch: { getAppConsoleWsEndpoint },
  } = useAppContext();
  const wsRef = React.useRef<WebSocket>();
  const isMountedRef = React.useRef(true);
  const sessionActiveRef = React.useRef(false);
  const hasReceivedMessageRef = React.useRef(false);
  const onMsgReceivedRef = React.useRef(onMsgReceived);
  onMsgReceivedRef.current = onMsgReceived;
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isClosed, setIsClosed] = React.useState(false);
  const [error, setError] = React.useState<AppConsoleConnectError>();
  const [reset, setReset] = React.useState(0);
  const forceConnectRef = React.useRef(false);

  const sendMessage = React.useCallback((data: string, resize?: boolean) => {
    // App console uses raw serial websocket (raw bytes, not k8s channels). Resize is not supported
    if (resize) {
      return;
    }
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(new TextEncoder().encode(data));
    }
  }, []);

  const disconnect = React.useCallback(() => {
    const ws = wsRef.current;
    if (!ws) {
      return;
    }
    closeAppConsoleWebSocket(ws);
    wsRef.current = undefined;
  }, []);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (!appName) {
      return undefined;
    }

    try {
      setIsConnecting(true);
      setIsClosed(false);
      setError(undefined);
      hasReceivedMessageRef.current = false;
      sessionActiveRef.current = false;

      const wsEndpoint = getAppConsoleWsEndpoint(deviceId, appName);
      const params = new URLSearchParams();
      if (organizationId) {
        params.set('org_id', organizationId);
      }
      const forceConnect = forceConnectRef.current;
      forceConnectRef.current = false;
      if (forceConnect) {
        params.set('force', 'true');
      }
      const query = params.toString();
      const wsUrl = query ? `${wsEndpoint}?${query}` : wsEndpoint;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';

      const handleOpen = () => {
        sessionActiveRef.current = true;
        if (isMountedRef.current) {
          setIsConnecting(false);
        }
      };

      const handleMessage = (evt: MessageEvent<ArrayBuffer | string | Blob>) => {
        if (!isMountedRef.current || !sessionActiveRef.current || ws.readyState !== WebSocket.OPEN) {
          return;
        }
        hasReceivedMessageRef.current = true;

        const deliver = (str: string) => {
          if (!isMountedRef.current || !sessionActiveRef.current || ws.readyState !== WebSocket.OPEN) {
            return;
          }
          void onMsgReceivedRef.current(str);
        };

        const { data } = evt;
        if (typeof data === 'string' || data instanceof ArrayBuffer) {
          try {
            deliver(decodeMessageData(data));
          } catch {
            // Ignore decode failures during session teardown.
          }
          return;
        }

        void decodeMessageDataAsync(data)
          .then(deliver)
          .catch(() => {
            // Ignore decode failures during session teardown.
          });
      };

      const handleClose = (evt: CloseEvent) => {
        sessionActiveRef.current = false;
        if (isMountedRef.current) {
          setIsConnecting(false);
          const connectError = connectErrorFromCloseEvent(evt);
          if (connectError.kind === 'sessionTakenOver' || connectError.kind === 'appNotReady') {
            setError(connectError);
            wsRef.current = undefined;
            return;
          }
          setIsClosed(true);
          if (isErrorCloseEvent(evt) && !hasReceivedMessageRef.current) {
            setError(connectError);
          }
        }
        wsRef.current = undefined;
      };

      const handleError = () => {
        sessionActiveRef.current = false;
        if (isMountedRef.current) {
          setIsConnecting(false);
          if (!hasReceivedMessageRef.current) {
            setError({ kind: 'unknownError' });
          } else {
            setIsClosed(true);
          }
        }
      };

      ws.addEventListener('open', handleOpen);
      ws.addEventListener('message', handleMessage);
      ws.addEventListener('close', handleClose);
      ws.addEventListener('error', handleError);
      wsRef.current = ws;

      return () => {
        sessionActiveRef.current = false;
        ws.removeEventListener('open', handleOpen);
        ws.removeEventListener('message', handleMessage);
        ws.removeEventListener('close', handleClose);
        ws.removeEventListener('error', handleError);
        closeAppConsoleWebSocket(ws);
        wsRef.current = undefined;
      };
    } catch {
      if (isMountedRef.current) {
        setIsConnecting(false);
        setError({ kind: 'unknownError' });
      }
      return () => undefined;
    }
  }, [deviceId, appName, organizationId, getAppConsoleWsEndpoint, reset]);

  const reconnect = React.useCallback(
    (options?: { force?: boolean }) => {
      forceConnectRef.current = options?.force === true;
      disconnect();
      setReset((prev) => prev + 1);
    },
    [disconnect],
  );

  return {
    sendMessage,
    isConnecting,
    isClosed,
    error,
    reconnect,
    disconnect,
  };
};
