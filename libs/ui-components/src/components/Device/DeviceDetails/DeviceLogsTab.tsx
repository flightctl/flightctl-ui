import * as React from 'react';
import { Bullseye, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { LogViewer } from '@patternfly/react-log-viewer';
import { Formik } from 'formik';

import { useDeviceLogs } from '../../../hooks/useDeviceLogs';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppContext } from '../../../hooks/useAppContext';
import {
  DEVICE_LOGS_FORM_INITIAL_VALUES,
  DeviceLogErrorType,
  DeviceLogSearchParams,
  getDeviceLogSearchSchema,
} from '../../../utils/deviceLogs';
import {
  buildDownloadFilename,
  downloadTextAsFile,
  formatDeviceLogsForExport as getExportableLogContent,
  openTextInNewTab,
} from '../../../utils/deviceLogDownload';
import { UserPreferencesContext } from '../../Masthead/UserPreferencesProvider';
import { DeviceLogsDisconnectedBanner, DeviceLogsEmptyState, DeviceLogsRetrievalError } from './DeviceLogsEmptyState';
import DeviceLogsSearchToolbar from './DeviceLogsSearchToolbar';
import DeviceLogsInnerToolbar from './DeviceLogsInnerToolbar';

type DeviceLogsTabProps = {
  deviceId: string;
};

// Adds an extra delay to "Retrieve logs", to ensure the Cancel button and the new action results can be observed clearly.
const MIN_RETRIEVE_SPINNER_MS = 400;

const toSnapshotParams = (params: DeviceLogSearchParams): DeviceLogSearchParams => ({
  ...params,
  showLiveLogs: false,
});

const DeviceLogsTab = ({ deviceId }: DeviceLogsTabProps) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const { resolvedTheme } = React.useContext(UserPreferencesContext);
  const [lastSearchParams, setLastSearchParams] = React.useState<DeviceLogSearchParams>();
  const [isRetrievePending, setIsRetrievePending] = React.useState(false);
  const retrievePendingStartedAtRef = React.useRef(0);
  const logPrefix = settings.isRHEM ? `rhem-${deviceId}` : `flightctl-${deviceId}`;

  const {
    logs,
    isConnecting,
    isFetching,
    isStreaming,
    errorTypeOrMsg,
    fetchSnapshot,
    startLiveStream,
    clearSession,
    stopLiveStream,
    closeSession,
    clearLiveLogsPreference,
    retrySearch,
  } = useDeviceLogs({
    deviceId,
  });

  const finishRetrievePending = React.useCallback(async () => {
    if (retrievePendingStartedAtRef.current === 0) {
      return;
    }
    const remaining = MIN_RETRIEVE_SPINNER_MS - (Date.now() - retrievePendingStartedAtRef.current);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, remaining);
    });
    retrievePendingStartedAtRef.current = 0;
    setIsRetrievePending(false);
  }, []);

  const runSnapshotSearch = React.useCallback(
    async (params: DeviceLogSearchParams) => {
      const snapshotParams = toSnapshotParams(params);
      setLastSearchParams(undefined);
      retrievePendingStartedAtRef.current = Date.now();
      setIsRetrievePending(true);
      try {
        const ok = await fetchSnapshot(snapshotParams);
        if (ok) {
          setLastSearchParams(snapshotParams);
        }
        return ok;
      } finally {
        await finishRetrievePending();
      }
    },
    [fetchSnapshot, finishRetrievePending],
  );

  const handleStartLiveStream = React.useCallback(async () => {
    if (!lastSearchParams) {
      return false;
    }
    const ok = await startLiveStream(lastSearchParams);
    if (ok) {
      setLastSearchParams({ ...lastSearchParams, showLiveLogs: true });
    }
    return ok;
  }, [lastSearchParams, startLiveStream]);

  const handleStopLiveStream = React.useCallback(() => {
    stopLiveStream();
    setLastSearchParams((prev) => (prev ? { ...prev, showLiveLogs: false } : prev));
  }, [stopLiveStream]);

  const handleClearLiveLogsPreference = React.useCallback(() => {
    clearLiveLogsPreference();
    setLastSearchParams((prev) => (prev ? { ...prev, showLiveLogs: false } : prev));
  }, [clearLiveLogsPreference]);

  const runSearchWithParams = React.useCallback(
    async (params: DeviceLogSearchParams) => {
      if (params.showLiveLogs) {
        const ok = await startLiveStream(params);
        if (ok) {
          setLastSearchParams({ ...params, showLiveLogs: true });
        }
        return ok;
      }
      return runSnapshotSearch(params);
    },
    [runSnapshotSearch, startLiveStream],
  );

  const onClearSession = React.useCallback(() => {
    retrievePendingStartedAtRef.current = 0;
    setIsRetrievePending(false);
    setLastSearchParams(undefined);
    clearSession();
  }, [clearSession]);

  const onCloseSession = React.useCallback(() => {
    retrievePendingStartedAtRef.current = 0;
    setIsRetrievePending(false);
    setLastSearchParams(undefined);
    closeSession();
  }, [closeSession]);

  const onDownload = React.useCallback(() => {
    if (!lastSearchParams) {
      return;
    }
    const content = getExportableLogContent(logs);
    const filename = buildDownloadFilename(logPrefix, lastSearchParams);
    downloadTextAsFile(content, filename);
  }, [logPrefix, logs, lastSearchParams]);

  const onOpenRaw = React.useCallback(() => {
    if (!lastSearchParams) {
      return;
    }
    const content = getExportableLogContent(logs);
    const isOpen = openTextInNewTab(content);
    if (!isOpen) {
      const filename = buildDownloadFilename(logPrefix, lastSearchParams);
      downloadTextAsFile(content, filename);
    }
  }, [logPrefix, logs, lastSearchParams]);

  const lineCount = logs.length;
  const isSearching = isConnecting || isFetching || isRetrievePending;
  const hasDisplayedLogs = Boolean(lastSearchParams && lineCount > 0);
  const showLogViewer = Boolean(lastSearchParams && (hasDisplayedLogs || isStreaming)) && !isSearching;
  const showEmptyState = !isSearching && !showLogViewer && !errorTypeOrMsg;
  const showRetrievalError = !isSearching && !showLogViewer && Boolean(errorTypeOrMsg);

  return (
    <Formik<DeviceLogSearchParams>
      initialValues={DEVICE_LOGS_FORM_INITIAL_VALUES}
      validationSchema={getDeviceLogSearchSchema(t)}
      onSubmit={runSnapshotSearch}
    >
      <Stack hasGutter>
        <StackItem>
          <DeviceLogsSearchToolbar
            onLogTypeChange={onCloseSession}
            isSubmitting={isSearching}
            onCancelSearch={onClearSession}
          />
        </StackItem>

        {isSearching && (
          <Bullseye>
            <Stack hasGutter>
              <StackItem>
                <Spinner size="xl" />
              </StackItem>
              <StackItem>{t('Retrieving logs')}</StackItem>
            </Stack>
          </Bullseye>
        )}
        {showEmptyState && <DeviceLogsEmptyState />}
        {showRetrievalError && <DeviceLogsRetrievalError errorTypeOrMsg={errorTypeOrMsg as DeviceLogErrorType} />}
        {showLogViewer && lastSearchParams && (
          <StackItem>
            <Stack hasGutter>
              <StackItem>
                <LogViewer
                  data={logs}
                  height={700}
                  hasLineNumbers
                  theme={resolvedTheme}
                  isTextWrapped
                  scrollToRow={isStreaming && lineCount > 0 ? lineCount : undefined}
                  toolbar={
                    <DeviceLogsInnerToolbar
                      lastSearchParams={lastSearchParams}
                      isStreaming={isStreaming}
                      onApplySearchParams={runSearchWithParams}
                      onStartLiveStream={handleStartLiveStream}
                      onStopLiveStream={handleStopLiveStream}
                      onClearLiveLogsPreference={handleClearLiveLogsPreference}
                      onClearSession={onClearSession}
                      onDownload={onDownload}
                      onOpenRaw={onOpenRaw}
                    >
                      {/* If we receive a disconection error after we had retrieved some logs, the logs stay visible. Users can download them and retry if needed. */}
                      {errorTypeOrMsg === 'CONNECTION_CLOSED' && (
                        <DeviceLogsDisconnectedBanner onRetry={() => void retrySearch()} />
                      )}
                    </DeviceLogsInnerToolbar>
                  }
                />
              </StackItem>
            </Stack>
          </StackItem>
        )}
      </Stack>
    </Formik>
  );
};

export default DeviceLogsTab;
