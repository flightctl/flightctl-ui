import * as React from 'react';
import { useFetch } from '../../hooks/useFetch';

export enum LogResourceType {
  BUILD = 'build',
  EXPORT = 'export',
}

/**
 * Extracts the content of log lines from SSE format.
 * Filters lines starting with 'data: ' and removes the prefix.
 * @param lines - Array of lines to process
 * @returns Log text content
 */
const getLogContent = (lines: string[]): string => {
  const logLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const logLine = line.slice(6); // Remove 'data: ' prefix
      logLines.push(logLine);
    }
  }

  return logLines.join('\n');
};

export const useImageBuildLogs = (
  resourceId: string,
  resourceType: LogResourceType = LogResourceType.BUILD,
  isActive: boolean,
) => {
  const { proxyFetch } = useFetch();

  const [logs, setLogs] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const readerRef = React.useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const endpoint = React.useMemo(() => {
    if (!resourceId) {
      return '';
    }

    const entityType = resourceType === LogResourceType.EXPORT ? 'imageexports' : 'imagebuilds';
    return `imagebuilder/api/v1/${entityType}/${resourceId}/log${isActive ? '?follow=true' : ''}`;
  }, [resourceId, resourceType, isActive]);

  React.useEffect(() => {
    if (!endpoint) {
      setIsLoading(false);
      setLogs('');
      setError(null);
      setIsStreaming(false);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        abortControllerRef.current = new AbortController();

        const response = await proxyFetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        const isSSE = contentType.includes('text/event-stream');

        if (isSSE && isActive) {
          // Handle SSE streaming
          if (!response.body) {
            throw new Error('Response body is null');
          }

          setIsStreaming(true);
          setIsLoading(false); // Stop showing spinner once streaming starts

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          readerRef.current = reader;
          let buffer = '';

          const readStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  // Process any remaining buffer content
                  if (buffer.trim()) {
                    const logText = getLogContent(buffer.split('\n'));
                    if (logText) {
                      setLogs((prev) => (prev ? `${prev}\n${logText}` : logText));
                    }
                  }
                  break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                const logText = getLogContent(lines);
                if (logText) {
                  setLogs((prev) => (prev ? `${prev}\n${logText}` : logText));
                }
              }
            } catch (err) {
              if (err instanceof Error && err.name !== 'AbortError') {
                setError(err);
              }
            } finally {
              setIsStreaming(false);
            }
          };

          readStream();
        } else {
          // Handle regular text response
          setIsStreaming(false);
          const text = await response.text();
          setLogs(text);
          setIsLoading(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
        setIsLoading(false);
      }
    };

    void fetchLogs();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {
          // Ignore cancellation errors
        });
      }
    };
  }, [endpoint, proxyFetch, isActive]);

  return { logs, isLoading, error, isStreaming };
};
