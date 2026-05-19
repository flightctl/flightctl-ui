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
  const activeSearchRef = React.useRef<ActiveSearch>();
  const logSearchSeqRef = React.useRef(0);
  const isMountedRef = React.useRef(true);
  const intentionalCloseRef = React.useRef(false);
  const isStreamingRef = React.useRef(false);
  const partialLineRef = React.useRef('');
  const lastSuccessfulSearchParamsRef = React.useRef<DeviceLogSearchParams>();

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
      intentionalCloseRef.current = true;
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
      wsRef.current = undefined;
    } else {
      intentionalCloseRef.current = false;
    }
  }, [clearActiveSearch, clearStreamingState]);

  const closeSession = React.useCallback(() => {
    lastSuccessfulSearchParamsRef.current = undefined;
    setLogs([]);
    setErrorTypeOrMsg(undefined);
    closeWebSocket();
    if (isMountedRef.current) {
      setIsConnecting(false);
      setIsFetching(false);
    }
  }, [closeWebSocket]);

  const appendLiveLogLines = React.useCallback((lines: string[]) => {
    if (lines.length === 0 || !isMountedRef.current) {
      return;
    }
    setLogs((prev) => [...prev, ...lines]);
  }, []);

  const handleConsoleFrame = React.useCallback(
    async (message: Blob) => {
      const bytes = new Uint8Array(await message.arrayBuffer());
      const pending = activeSearchRef.current;
      if (!pending) {
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
            if (active) {
              if (active.timeoutId) {
                clearTimeout(active.timeoutId);
              }
              activeSearchRef.current = undefined;
              if (active.completionKind !== DeviceLogCompletionKind.LIVE_STREAM) {
                active.reject(new Error(t('Log retrieval failed with exit code {{code}}', { code: parsed.code })));
              }
            }
            clearStreamingState();
            if (isMountedRef.current) {
              if (!isLive) {
                setLogs([]);
              }
              setErrorTypeOrMsg(
                buffer ? t('Log retrieval failed with exit code {{code}}', { code: parsed.code }) : 'CONNECTION_CLOSED',
              );
              setIsFetching(false);
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
    [t, appendLiveLogLines, clearStreamingState],
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
          connectPromiseRef.current = undefined;
          if (isMountedRef.current) {
            setIsConnecting(false);
          }
          resolve();
        };

        ws.onerror = () => {
          connectPromiseRef.current = undefined;
          if (isMountedRef.current) {
            setIsConnecting(false);
            setErrorTypeOrMsg('CONNECTION_ERROR');
          }
          reject(new Error('Failed to connect to device'));
          ws.close();
        };

        ws.onclose = (evt: CloseEvent) => {
          connectPromiseRef.current = undefined;
          wsRef.current = undefined;
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
            } else {
              if (isErrorCloseEvent(evt)) {
                setErrorTypeOrMsg('CONNECTION_CLOSED');
              }
            }
          }
        };
      } catch (err) {
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

  const search = React.useCallback(
    async (params: DeviceLogSearchParams): Promise<boolean> => {
      // When the live stream is turned off, the stream stops and the current log buffer is kept.
      if (!params.showLiveLogs && isStreamingRef.current) {
        closeWebSocket();
        lastSuccessfulSearchParamsRef.current = params;
        if (isMountedRef.current) {
          setIsFetching(false);
          setErrorTypeOrMsg(undefined);
        }
        return true;
      }

      setErrorTypeOrMsg(undefined);
      setIsFetching(true);

      try {
        if (params.showLiveLogs) {
          closeWebSocket();
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

        const startLiveStream = (command: string) => {
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
            setLogs([]);
            setIsStreaming(true);
            setIsFetching(false);
          }
          ws.send(encodeStdinPayload(command));
        };

        // Send the commands to perform the desired search.
        if (params.showLiveLogs) {
          startLiveStream(getRetrieveLogContentCommand(params));
        } else {
          if (needsFileProbe(params, lastSuccessfulSearchParamsRef.current?.logFilePath)) {
            await runLogRequest(getFileProbeCommand(params), DeviceLogCompletionKind.FILE_PROBE);
          }
          await runLogRequest(getRetrieveLogContentCommand(params), DeviceLogCompletionKind.LOGS);
        }
        lastSuccessfulSearchParamsRef.current = params;
        return true;
      } catch (e) {
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
    [ensureWebSocket, closeWebSocket, clearStreamingState],
  );

  React.useEffect(() => {
    return () => {
      lastSuccessfulSearchParamsRef.current = undefined;
      closeWebSocket();
    };
  }, [closeWebSocket]);

  const retrySearch = React.useCallback(async () => {
    const lastParams = lastSuccessfulSearchParamsRef.current;
    if (!lastParams) {
      return;
    }
    closeWebSocket();
    await search(lastParams);
  }, [closeWebSocket, search]);

  return {
    logs,
    isConnecting,
    isFetching,
    isStreaming,
    errorTypeOrMsg,
    search,
    closeSession,
    retrySearch,
  };
};
