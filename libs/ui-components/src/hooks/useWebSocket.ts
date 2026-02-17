import * as React from 'react';
import { useTranslation } from './useTranslation';
import { useAppContext } from './useAppContext';

const msgToBytes = (msg: string, resize?: boolean) => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(msg);
  const result = new Uint8Array(encodedData.length + 1);
  result[0] = resize ? 0x4 : 0x00;
  result.set(encodedData, 1);
  return result;
};

const isErrorCloseEvent = (evt: CloseEvent) => evt.code !== 1000 && evt.code !== 1001;

export type WsMetadata = {
  tty: boolean;
  term: string;
};

export const useWebSocket = <T>(
  deviceId: string,
  organizationId: string | undefined,
  onMsgReceived: (msg: T) => Promise<void>,
  wsMetadata: WsMetadata,
): {
  sendMessage: (msg: string, resize?: boolean) => void;
  isConnecting: boolean;
  isClosed: boolean;
  error: unknown;
  reconnect: VoidFunction;
} => {
  const {
    fetch: { getWsEndpoint },
  } = useAppContext();
  const { t } = useTranslation();
  const wsRef = React.useRef<WebSocket>();
  const isMountedRef = React.useRef(true);
  const hasReceivedMessageRef = React.useRef(false);
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isClosed, setIsClosed] = React.useState(false);
  const [error, setError] = React.useState<unknown>();
  const [reset, setReset] = React.useState<number>(0);

  const sendMessage = React.useCallback((data: string, resize?: boolean) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(msgToBytes(data, resize));
    }
  }, []);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    try {
      setIsConnecting(true);
      setIsClosed(false);
      setError(undefined);
      hasReceivedMessageRef.current = false;
      const wsEndpoint = getWsEndpoint(deviceId);
      const wsMeta = JSON.stringify(wsMetadata);
      const params = new URLSearchParams({
        metadata: wsMeta,
      });

      // NOTE: Since webSocket connections can't use custom headers, we must add the "org_id" query parameter to the URL instead
      if (organizationId) {
        params.set('org_id', organizationId);
      }

      const ws = new WebSocket(`${wsEndpoint}?${params.toString()}`, 'v5.channel.k8s.io');

      const handleOpen = () => {
        if (isMountedRef.current) {
          setIsConnecting(false);
        }
      };

      const handleClose = (evt: CloseEvent) => {
        if (isMountedRef.current) {
          setIsConnecting(false);
          setIsClosed(true);
          // If we never received any data from the backend, treat an error close as a failure
          // Otherwise it may be a normal session close, and we'll show the "Reconnect" banner.
          if (isErrorCloseEvent(evt) && !hasReceivedMessageRef.current) {
            const reason = evt.reason || t('Unknown error');
            setError(t('Failed to connect to device terminal: {{reason}}', { reason }));
          }
        }
        wsRef.current = undefined;
      };

      const handleError = (evt: Event) => {
        // eslint-disable-next-line no-console
        console.error('Error creating websocket:', evt);
        if (isMountedRef.current) {
          setIsConnecting(false);
          if (!hasReceivedMessageRef.current) {
            setError(t('Failed to connect to device terminal'));
          } else {
            // User may have closed the session, so we'll show the "Reconnect" banner.
            setIsClosed(true);
          }
        }
      };

      ws.addEventListener('open', handleOpen);
      ws.addEventListener('close', handleClose);
      ws.addEventListener('error', handleError);
      wsRef.current = ws;

      return () => {
        ws.removeEventListener('open', handleOpen);
        ws.removeEventListener('close', handleClose);
        ws.removeEventListener('error', handleError);
        ws.close();
        wsRef.current = undefined;
      };
    } catch (err) {
      if (isMountedRef.current) {
        setIsConnecting(false);
        setError(err);
      }
      return () => {
        // No cleanup needed if WebSocket creation failed
      };
    }
  }, [deviceId, organizationId, t, getWsEndpoint, reset, wsMetadata]);

  const reconnect = React.useCallback(() => {
    wsRef.current?.close();
    wsRef.current = undefined;
    setReset((prev) => prev + 1);
  }, []);

  React.useEffect(() => {
    const listener = (evt: MessageEvent<T>) => {
      if (isMountedRef.current) {
        hasReceivedMessageRef.current = true;
        onMsgReceived(evt.data);
      }
    };
    const ws = wsRef.current;
    ws?.addEventListener('message', listener);
    return () => {
      ws?.removeEventListener('message', listener);
    };
  }, [onMsgReceived, reset]);

  return {
    sendMessage,
    isConnecting,
    isClosed,
    error,
    reconnect,
  };
};
