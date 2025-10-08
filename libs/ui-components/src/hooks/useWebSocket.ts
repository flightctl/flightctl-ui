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
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isClosed, setIsClosed] = React.useState(false);
  const [error, setError] = React.useState<unknown>();
  const [reset, setReset] = React.useState<number>(0);

  const sendMessage = React.useCallback((data: string, resize?: boolean) => {
    wsRef.current?.send(msgToBytes(data, resize));
  }, []);

  React.useEffect(() => {
    try {
      setIsConnecting(true);
      setIsClosed(false);
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
      ws.addEventListener('open', () => setIsConnecting(false));
      ws.addEventListener('close', () => {
        setIsClosed(true);
        wsRef.current = undefined;
      });
      ws.addEventListener('error', (evt) => {
        // eslint-disable-next-line no-console
        console.error('Error creating websocket:', evt);
        setError(t('Websocket error occured'));
      });
      wsRef.current = ws;
    } catch (err) {
      setIsConnecting(false);
      setError(err);
    }
    return () => {
      wsRef.current?.close();
      wsRef.current = undefined;
    };
  }, [deviceId, organizationId, t, getWsEndpoint, reset, wsMetadata]);

  const reconnect = React.useCallback(() => {
    wsRef.current?.close();
    wsRef.current = undefined;
    setReset((prev) => prev + 1);
  }, []);

  React.useEffect(() => {
    const listener = (evt: MessageEvent<T>) => onMsgReceived(evt.data);
    wsRef.current?.addEventListener('message', listener);
    return () => {
      wsRef.current?.removeEventListener('message', listener);
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
