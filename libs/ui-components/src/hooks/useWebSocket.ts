import * as React from 'react';
import { useTranslation } from './useTranslation';
import { useAppContext } from './useAppContext';

export const useWebSocket = <T>(
  deviceId: string,
  onMsgReceived: (msg: T) => Promise<void>,
): {
  sendMessage: (msg: string) => void;
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

  const sendMessage = React.useCallback((data: string) => {
    wsRef.current?.send(data);
  }, []);

  React.useEffect(() => {
    try {
      setIsConnecting(true);
      setIsClosed(false);
      const { wsEndpoint, protocols } = getWsEndpoint(deviceId);
      const ws = new WebSocket(wsEndpoint, protocols);
      ws.addEventListener('open', () => setIsConnecting(false));
      ws.addEventListener('close', () => setIsClosed(true));
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
  }, [deviceId, t, getWsEndpoint, reset]);

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
