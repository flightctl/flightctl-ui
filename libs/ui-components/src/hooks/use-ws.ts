import * as React from 'react';
import { useTranslation } from './useTranslation';
import { useAppContext } from './useAppContext';

export const useWebSocket = <T extends string>(
  endpoint: string,
  onMsgReceived: (msg: T) => void,
): {
  sendMessage: (msg: T) => void;
  isConnecting: boolean;
  isClosed: boolean;
  error: unknown;
  reconnect: VoidFunction;
} => {
  const {
    fetch: { wsEndpoint },
  } = useAppContext();
  const { t } = useTranslation();
  const wsRef = React.useRef<WebSocket>();
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [isClosed, setIsClosed] = React.useState(false);
  const [error, setError] = React.useState<unknown>();
  const [reset, setReset] = React.useState<number>(0);

  const sendMessage = React.useCallback((data: T) => {
    wsRef.current?.send(data);
  }, []);

  React.useMemo(() => {
    try {
      setIsConnecting(true);
      setIsClosed(false);
      const ws = new WebSocket(`${wsEndpoint}${endpoint}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, t, reset, wsEndpoint]);

  React.useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = undefined;
    };
  }, [endpoint]);

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
  }, [onMsgReceived]);

  return {
    sendMessage,
    isConnecting,
    isClosed,
    error,
    reconnect,
  };
};
