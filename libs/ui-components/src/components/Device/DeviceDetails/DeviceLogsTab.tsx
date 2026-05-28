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

const DeviceLogsTab = ({ deviceId }: DeviceLogsTabProps) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const { resolvedTheme } = React.useContext(UserPreferencesContext);
  const [lastSearchParams, setLastSearchParams] = React.useState<DeviceLogSearchParams>();
  const logPrefix = settings.isRHEM ? `rhem-${deviceId}` : `flightctl-${deviceId}`;

  const { logs, isConnecting, isFetching, isStreaming, errorTypeOrMsg, search, closeSession, retrySearch } =
    useDeviceLogs({
      deviceId,
    });
  const lineCount = logs.length;

  const onLogSearch = React.useCallback(
    async (params: DeviceLogSearchParams) => {
      const ok = await search(params);
      if (ok) {
        setLastSearchParams(params);
      }
      return ok;
    },
    [search],
  );

  const onResetForm = React.useCallback(() => {
    setLastSearchParams(DEVICE_LOGS_FORM_INITIAL_VALUES);
    closeSession();
  }, [closeSession, setLastSearchParams]);

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
      // Fallback to download if the tab to show the file could not be opened
      const filename = buildDownloadFilename(logPrefix, lastSearchParams);
      downloadTextAsFile(content, filename);
    }
  }, [logPrefix, logs, lastSearchParams]);

  const hasDisplayedLogs = Boolean(lastSearchParams && lineCount > 0);
  const isInitialLoading = (isConnecting || isFetching) && !hasDisplayedLogs && !isStreaming;
  const showLogViewer = Boolean(lastSearchParams && (hasDisplayedLogs || isStreaming)) && !isInitialLoading;
  const showEmptyState = !isInitialLoading && !showLogViewer && !errorTypeOrMsg;
  const showRetrievalError = !isInitialLoading && !showLogViewer && Boolean(errorTypeOrMsg);

  return (
    <Formik<DeviceLogSearchParams>
      initialValues={DEVICE_LOGS_FORM_INITIAL_VALUES}
      validationSchema={getDeviceLogSearchSchema(t)}
      onSubmit={onLogSearch}
    >
      <Stack hasGutter>
        <StackItem>
          <DeviceLogsSearchToolbar onLogTypeChange={onResetForm} />
        </StackItem>

        {isInitialLoading && (
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
                      onSearchUpdate={onLogSearch}
                      onResetForm={onResetForm}
                      onDownload={onDownload}
                      onOpenRaw={onOpenRaw}
                    >
                      {/* If we receive a disconection error after we had retrieved some logs, the logs stay visible. Users can download them and retry if needed. */}
                      {errorTypeOrMsg === 'CONNECTION_CLOSED' && <DeviceLogsDisconnectedBanner onRetry={retrySearch} />}
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
