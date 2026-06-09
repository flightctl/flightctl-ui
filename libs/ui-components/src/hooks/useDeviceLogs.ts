import * as React from 'react';

import { useTranslation } from './useTranslation';
import { useAppContext } from './useAppContext';
import { useOrganizationGuardContext } from '../components/common/OrganizationGuard';
import { DeviceLogCategory, DeviceLogErrorType, type DeviceLogSearchParams } from '../utils/deviceLogs';
import {
  DeviceLogFileProbeError,
  parseCompletedDeviceLogStreamBuffer,
  parseDeviceLogFileProbeBuffer,
  parseIncrementalDeviceLogStreamChunk,
} from '../utils/deviceLogCommandHandler';
import { getFileProbeCommand, getRetrieveLogContentCommand } from '../utils/deviceLogCommandBuilder';
import { getErrorMessage } from '../utils/error';

const LOGS_WS_METADATA = {
  tty: false,
  term: 'xterm-256color',
  command: { command: '/bin/bash', args: ['-s'] },
} as const;

const STDIN_STREAM_BYTE = 0x00;
const SEARCH_TIMEOUT_MS = 50_000;
const SEARCH_CANCELLED_MESSAGE = 'CANCELLED';
const SEARCH_SUPERSEDED_MESSAGE = 'SUPERSEDED';
const K8S_CHANNEL_STDOUT = 1;
const K8S_CHANNEL_STDERR = 2;
const K8S_CHANNEL_STATUS = 3;

const isErrorCloseEvent = (evt: CloseEvent) => evt.code !== 1000 && evt.code !== 1001;

const encodeStdinPayload = (text: string): Uint8Array => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  const out = new Uint8Array(encoded.length + 1);
  out[0] = STDIN_STREAM_BYTE;
  out.set(encoded, 1);
  return out;
};

enum DeviceLogCompletionKind {
  FILE_PROBE = 'fileProbe',
  LOGS = 'logContent',
  LIVE_STREAM = 'liveStream',
}

type ActiveSearch = {
  searchId: number;
  buffer: string;
  timeoutId?: ReturnType<typeof setTimeout>;
  resolve: VoidFunction;
  reject: (err: Error) => void;
  completionKind: DeviceLogCompletionKind;
};

export type UseDeviceLogsArgs = {
  deviceId: string;
};

// For files, we perform a file probe to ensure the path points to a valid file (file exists, it's a text file, etc).
// The probe is therefore only needed once per logFilePath.
const needsFileProbe = (params: DeviceLogSearchParams, prevLogFilePath?: string): boolean =>
  params.category === DeviceLogCategory.FILE && (!prevLogFilePath || prevLogFilePath !== params.logFilePath);

export const useDeviceLogs = ({ deviceId }: UseDeviceLogsArgs) => {
  const { t } = useTranslation();
  const { currentOrganization } = useOrganizationGuardContext();
  const {
    fetch: { getWsEndpoint },
  } = useAppContext();

  const organizationId = currentOrganization?.id as string;
  const wsRef = React.useRef<WebSocket>();
  const connectPromiseRef = React.useRef<Promise<void>>();
  const connectRejectRef = React.useRef<(reason?: Error) => void>();
  const activeSearchRef = React.useRef<ActiveSearch>();
  const logSearchSeqRef = React.useRef(0);
  const isMountedRef = React.useRef(true);
  const intentionalCloseRef = React.useRef(false);
  const isStreamingRef = React.useRef(false);
  const partialLineRef = React.useRef('');
  const lastSuccessfulSearchParamsRef = React.useRef<DeviceLogSearchParams>();
  const requestGenerationRef = React.useRef(0);

  const isActiveSearch = React.useCallback((pending: ActiveSearch) => activeSearchRef.current === pending, []);

  const [logs, setLogs] = React.useState<string[]>([]);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  // Despite its typing, "errorTypeOrMsg" can be a DeviceLogErrorType or a generic error message
  // The untyped error message is only used in the case of uncontrolled errors.
  const [errorTypeOrMsg, setErrorTypeOrMsg] = React.useState<DeviceLogErrorType | undefined>();

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearStreamingState = React.useCallback(() => {
    isStreamingRef.current = false;
    partialLineRef.current = '';
    if (isMountedRef.current) {
      setIsStreaming(false);
    }
  }, []);

  const clearActiveSearch = React.useCallback(() => {
    const s = activeSearchRef.current;
    if (s) {
      if (s.timeoutId) {
        clearTimeout(s.timeoutId);
      }
      activeSearchRef.current = undefined;
    }
  }, []);

  const closeWebSocket = React.useCallback(() => {
    clearActiveSearch();
    clearStreamingState();
    connectPromiseRef.current = undefined;
    const ws = wsRef.current;
    if (ws) {
      // Handlers are cleared so this socket's onclose/onerror will not run; do not leave
      // intentionalCloseRef set — that would make the next connection's disconnect look intentional.
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
      wsRef.current = undefined;
    }
    intentionalCloseRef.current = false;
  }, [clearActiveSearch, clearStreamingState]);

  const shouldCloseWebSocket = React.useCallback((): boolean => {
    if (isStreamingRef.current) {
      return true;
    }
    const ws = wsRef.current;
    return !ws || ws.readyState !== WebSocket.OPEN;
  }, []);

  const resetSession = React.useCallback(
    (options: { forceClose?: boolean; abortMessage?: string }) => {
      requestGenerationRef.current += 1;

      const pending = activeSearchRef.current;
      if (pending) {
        if (pending.timeoutId) {
          clearTimeout(pending.timeoutId);
        }
        activeSearchRef.current = undefined;
        if (pending.completionKind !== DeviceLogCompletionKind.LIVE_STREAM && options.abortMessage) {
          pending.reject(new Error(options.abortMessage));
        }
      }

      const closeConnection = options.forceClose === true || shouldCloseWebSocket();

      if (closeConnection) {
        const abortError = options.abortMessage ?? SEARCH_CANCELLED_MESSAGE;
        connectRejectRef.current?.(new Error(abortError));
        connectRejectRef.current = undefined;
        connectPromiseRef.current = undefined;
        intentionalCloseRef.current = true;
        closeWebSocket();
      } else {
        clearActiveSearch();
        clearStreamingState();
      }

      lastSuccessfulSearchParamsRef.current = undefined;
      if (isMountedRef.current) {
        setLogs([]);
        setErrorTypeOrMsg(undefined);
        setIsConnecting(false);
        setIsFetching(false);
      }
    },
    [clearActiveSearch, clearStreamingState, closeWebSocket, shouldCloseWebSocket],
  );

  const clearSession = React.useCallback(
    () => resetSession({ abortMessage: SEARCH_CANCELLED_MESSAGE }),
    [resetSession],
  );

  const closeSession = React.useCallback(() => resetSession({ forceClose: true }), [resetSession]);

  const stopLiveStream = React.useCallback(() => {
    if (!isStreamingRef.current) {
      return;
    }
    requestGenerationRef.current += 1;
    intentionalCloseRef.current = true;
    closeWebSocket();
    if (lastSuccessfulSearchParamsRef.current) {
      lastSuccessfulSearchParamsRef.current = {
        ...lastSuccessfulSearchParamsRef.current,
        showLiveLogs: false,
      };
    }
    if (isMountedRef.current) {
      setIsFetching(false);
      setErrorTypeOrMsg(undefined);
    }
  }, [closeWebSocket]);

  const abortInFlightSearch = React.useCallback(() => {
    const pending = activeSearchRef.current;
    if (!pending) {
      return;
    }
    if (pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }
    activeSearchRef.current = undefined;
    if (pending.completionKind !== DeviceLogCompletionKind.LIVE_STREAM) {
      pending.reject(new Error(SEARCH_SUPERSEDED_MESSAGE));
    }
  }, []);

  const cancelSearch = clearSession;

  const appendLiveLogLines = React.useCallback((lines: string[]) => {
    if (lines.length === 0 || !isMountedRef.current || !isStreamingRef.current) {
      return;
    }
    setLogs((prev) => [...prev, ...lines]);
  }, []);

  const handleConsoleFrame = React.useCallback(
    async (message: Blob) => {
      const pending = activeSearchRef.current;
      if (!pending) {
        return;
      }

      const bytes = new Uint8Array(await message.arrayBuffer());
      if (!isActiveSearch(pending)) {
        return;
      }

      const msgType = bytes[0];
      const decoder = new TextDecoder();
      const str = decoder.decode(bytes.slice(1));

      if (msgType === K8S_CHANNEL_STATUS) {
        try {
          const parsed = JSON.parse(str) as { code: number; status: string };
          if (parsed.status === 'Failure') {
            const active = activeSearchRef.current;
            const buffer = active?.buffer.trim();
            const isLive = active?.completionKind === DeviceLogCompletionKind.LIVE_STREAM;
            if (active && isActiveSearch(active)) {
              if (active.timeoutId) {
                clearTimeout(active.timeoutId);
              }
              activeSearchRef.current = undefined;
              if (active.completionKind !== DeviceLogCompletionKind.LIVE_STREAM) {
                active.reject(new Error(t('Log retrieval failed with exit code {{code}}', { code: parsed.code })));
              }
              clearStreamingState();
              if (isMountedRef.current) {
                if (!isLive) {
                  setLogs([]);
                }
                setErrorTypeOrMsg(
                  buffer
                    ? t('Log retrieval failed with exit code {{code}}', { code: parsed.code })
                    : 'CONNECTION_CLOSED',
                );
                setIsFetching(false);
              }
            }
            return;
          }
          // Success: `bash -s` keeps running; log retrieval completion uses the stdout footer line.
          return;
        } catch {
          return;
        }
      }

      if (msgType === K8S_CHANNEL_STDOUT || msgType === K8S_CHANNEL_STDERR) {
        if (!isActiveSearch(pending)) {
          return;
        }

        if (pending.completionKind === DeviceLogCompletionKind.LIVE_STREAM) {
          const { lines, partialLine } = parseIncrementalDeviceLogStreamChunk(str, partialLineRef.current);
          partialLineRef.current = partialLine;
          appendLiveLogLines(lines);
          return;
        }

        pending.buffer += str;

        if (pending.completionKind === DeviceLogCompletionKind.FILE_PROBE) {
          const probeParsed = parseDeviceLogFileProbeBuffer(pending.buffer);
          if (probeParsed.status === 'incomplete') {
            return;
          }
          if (!isActiveSearch(pending)) {
            return;
          }
          if (pending.timeoutId) {
            clearTimeout(pending.timeoutId);
          }
          activeSearchRef.current = undefined;
          if (probeParsed.status === 'script_failed') {
            pending.reject(
              new Error(t('Log retrieval failed with exit code {{code}}', { code: probeParsed.exitCode })),
            );
            return;
          }
          // We send the error type based on the probe result to be able to display different error messages in the UI.
          const probe = probeParsed.probe;
          if (!probe.exists) {
            pending.reject(new DeviceLogFileProbeError('FILE_NOT_FOUND'));
          } else if (!probe.isFile) {
            pending.reject(new DeviceLogFileProbeError('FILE_IS_DIRECTORY'));
          } else if (!probe.isValidSize) {
            pending.reject(new DeviceLogFileProbeError('FILE_TOO_LARGE'));
          } else if (!probe.isValidMime) {
            pending.reject(new DeviceLogFileProbeError('NOT_A_TEXT_FILE'));
          } else {
            pending.resolve();
          }
          return;
        }

        const completed = parseCompletedDeviceLogStreamBuffer(pending.buffer);
        if (!completed) {
          return;
        }

        if (!isActiveSearch(pending)) {
          return;
        }

        if (pending.timeoutId) {
          clearTimeout(pending.timeoutId);
        }
        activeSearchRef.current = undefined;
        pending.resolve();

        if (isMountedRef.current) {
          setIsFetching(false);
          if (completed.exitCode !== 0) {
            const detail = completed.lines.join('\n');
            const errorMsg =
              detail.length > 0
                ? detail
                : t('Log retrieval failed with exit code {{code}}', { code: completed.exitCode });
            setErrorTypeOrMsg(errorMsg as DeviceLogErrorType);
            setLogs([]);
          } else {
            setLogs(completed.lines);
            setErrorTypeOrMsg(undefined);
          }
        }
      }
    },
    [t, appendLiveLogLines, clearStreamingState, isActiveSearch],
  );

  const ensureWebSocket = React.useCallback((): Promise<void> => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    if (connectPromiseRef.current) {
      return connectPromiseRef.current;
    }

    setErrorTypeOrMsg(undefined);
    setIsConnecting(true);

    connectPromiseRef.current = new Promise<void>((resolve, reject) => {
      connectRejectRef.current = reject;
      try {
        const wsEndpoint = getWsEndpoint(deviceId);
        const wsMeta = JSON.stringify(LOGS_WS_METADATA);
        const params = new URLSearchParams({ metadata: wsMeta });
        if (organizationId) {
          params.set('org_id', organizationId);
        }
        const ws = new WebSocket(`${wsEndpoint}?${params.toString()}`, 'v5.channel.k8s.io');
        wsRef.current = ws;

        ws.onmessage = (evt) => {
          void handleConsoleFrame(evt.data as Blob);
        };

        ws.onopen = () => {
          intentionalCloseRef.current = false;
          connectRejectRef.current = undefined;
          connectPromiseRef.current = undefined;
          if (isMountedRef.current) {
            setIsConnecting(false);
          }
          resolve();
        };

        ws.onerror = () => {
          connectRejectRef.current = undefined;
          connectPromiseRef.current = undefined;
          if (intentionalCloseRef.current) {
            intentionalCloseRef.current = false;
            reject(new Error(SEARCH_CANCELLED_MESSAGE));
            return;
          }
          const wasStreaming = isStreamingRef.current;
          if (isMountedRef.current) {
            setIsConnecting(false);
            setErrorTypeOrMsg(wasStreaming ? 'CONNECTION_CLOSED' : 'CONNECTION_ERROR');
          }
          reject(new Error('Failed to connect to device'));
          ws.close();
        };

        ws.onclose = (evt: CloseEvent) => {
          connectRejectRef.current = undefined;
          connectPromiseRef.current = undefined;
          wsRef.current = undefined;
          const wasStreaming = isStreamingRef.current;
          const pendingSearch = activeSearchRef.current;
          if (pendingSearch) {
            if (pendingSearch.timeoutId) {
              clearTimeout(pendingSearch.timeoutId);
            }
            activeSearchRef.current = undefined;
            if (pendingSearch.completionKind !== DeviceLogCompletionKind.LIVE_STREAM) {
              pendingSearch.reject(new Error('CONNECTION_CLOSED'));
            }
          }
          clearStreamingState();
          if (isMountedRef.current) {
            setIsConnecting(false);
            setIsFetching(false);
            if (intentionalCloseRef.current) {
              intentionalCloseRef.current = false;
            } else if (isErrorCloseEvent(evt) || wasStreaming) {
              setErrorTypeOrMsg('CONNECTION_CLOSED');
            }
          }
        };
      } catch (err) {
        connectRejectRef.current = undefined;
        connectPromiseRef.current = undefined;
        const msg = getErrorMessage(err);
        if (isMountedRef.current) {
          setIsConnecting(false);
          setErrorTypeOrMsg('CONNECTION_ERROR');
        }
        reject(err instanceof Error ? err : new Error(msg));
      }
    });

    return connectPromiseRef.current;
  }, [deviceId, organizationId, getWsEndpoint, handleConsoleFrame, clearStreamingState]);

  const executeLogRequest = React.useCallback(
    async (params: DeviceLogSearchParams, mode: 'snapshot' | 'live'): Promise<boolean> => {
      const generation = ++requestGenerationRef.current;
      const isCurrentRequest = () => generation === requestGenerationRef.current;

      setErrorTypeOrMsg(undefined);
      if (isMountedRef.current) {
        setLogs([]);
      }
      setIsFetching(true);

      const commandParams: DeviceLogSearchParams =
        mode === 'live' ? { ...params, showLiveLogs: true } : { ...params, showLiveLogs: false };

      try {
        // Reuse the console WebSocket for consecutive snapshot searches. Close only when entering/leaving
        // live follow mode (or when the tab resets the session / cancels / unmounts).
        if (mode === 'live' || isStreamingRef.current) {
          closeWebSocket();
        } else {
          abortInFlightSearch();
        }

        await ensureWebSocket();
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error('no websocket');
        }

        const runLogRequest = (command: string, completionKind: DeviceLogCompletionKind): Promise<void> =>
          new Promise<void>((resolve, reject) => {
            const searchId = ++logSearchSeqRef.current;
            const timeoutId = setTimeout(() => {
              const cur = activeSearchRef.current;
              if (cur?.searchId === searchId) {
                activeSearchRef.current = undefined;
                cur.reject(new Error('TIMEOUT'));
              }
            }, SEARCH_TIMEOUT_MS);

            activeSearchRef.current = {
              searchId,
              buffer: '',
              timeoutId,
              resolve,
              reject,
              completionKind,
            };

            ws.send(encodeStdinPayload(command));
          });

        if (mode === 'live') {
          partialLineRef.current = '';
          isStreamingRef.current = true;
          activeSearchRef.current = {
            searchId: ++logSearchSeqRef.current,
            buffer: '',
            resolve: () => undefined,
            reject: () => undefined,
            completionKind: DeviceLogCompletionKind.LIVE_STREAM,
          };
          if (isMountedRef.current) {
            setIsStreaming(true);
            setIsFetching(false);
          }
          ws.send(encodeStdinPayload(getRetrieveLogContentCommand(commandParams)));
        } else {
          if (needsFileProbe(commandParams, lastSuccessfulSearchParamsRef.current?.logFilePath)) {
            await runLogRequest(getFileProbeCommand(commandParams), DeviceLogCompletionKind.FILE_PROBE);
          }
          await runLogRequest(getRetrieveLogContentCommand(commandParams), DeviceLogCompletionKind.LOGS);
        }

        if (!isCurrentRequest()) {
          return false;
        }

        lastSuccessfulSearchParamsRef.current = commandParams;
        return true;
      } catch (e) {
        if (!isCurrentRequest()) {
          return false;
        }

        clearStreamingState();
        if (e instanceof DeviceLogFileProbeError) {
          if (isMountedRef.current) {
            setErrorTypeOrMsg(e.errorType);
            setLogs([]);
            setIsFetching(false);
          }
          return false;
        }
        const err = e instanceof Error ? e : new Error(String(e));
        if (err.message === SEARCH_CANCELLED_MESSAGE || err.message === SEARCH_SUPERSEDED_MESSAGE) {
          if (isMountedRef.current) {
            setLogs([]);
            setErrorTypeOrMsg(undefined);
            setIsFetching(false);
            setIsConnecting(false);
          }
          return false;
        }
        if (isMountedRef.current) {
          if (err.message === 'TIMEOUT' || err.message === 'CONNECTION_ERROR') {
            setErrorTypeOrMsg(err.message as DeviceLogErrorType);
          } else {
            setErrorTypeOrMsg(getErrorMessage(e) as DeviceLogErrorType);
          }
          setIsFetching(false);
        }
        return false;
      }
    },
    [ensureWebSocket, closeWebSocket, clearStreamingState, abortInFlightSearch],
  );

  const fetchSnapshot = React.useCallback(
    (params: DeviceLogSearchParams) => executeLogRequest(params, 'snapshot'),
    [executeLogRequest],
  );

  const startLiveStream = React.useCallback(
    (params: DeviceLogSearchParams) => executeLogRequest(params, 'live'),
    [executeLogRequest],
  );

  React.useEffect(() => {
    return () => {
      lastSuccessfulSearchParamsRef.current = undefined;
      closeWebSocket();
    };
  }, [closeWebSocket]);

  const clearLiveLogsPreference = React.useCallback(() => {
    if (lastSuccessfulSearchParamsRef.current) {
      lastSuccessfulSearchParamsRef.current = {
        ...lastSuccessfulSearchParamsRef.current,
        showLiveLogs: false,
      };
    }
  }, []);

  const retrySearch = React.useCallback(async () => {
    const lastParams = lastSuccessfulSearchParamsRef.current;
    if (!lastParams) {
      return false;
    }
    if (lastParams.showLiveLogs) {
      return startLiveStream(lastParams);
    }
    return fetchSnapshot(lastParams);
  }, [fetchSnapshot, startLiveStream]);

  return {
    logs,
    isConnecting,
    isFetching,
    isStreaming,
    errorTypeOrMsg,
    fetchSnapshot,
    startLiveStream,
    cancelSearch,
    clearSession,
    stopLiveStream,
    closeSession,
    clearLiveLogsPreference,
    retrySearch,
  };
};
