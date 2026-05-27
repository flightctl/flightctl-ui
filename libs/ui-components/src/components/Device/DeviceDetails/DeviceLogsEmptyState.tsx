import * as React from 'react';
import { TFunction } from 'react-i18next';
import {
  Banner,
  Button,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons/dist/js/icons/cubes-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { DEVICE_LOG_BASE_PATH, DeviceLogErrorType } from '../../../utils/deviceLogs';
import { useTranslation } from '../../../hooks/useTranslation';

// Note: Despite the function signature, errorType can actually be a plain string.
// This happens when we receive an uncontrolled error, and instead of the errorType we store the actual error message.
const getErrorDetails = (t: TFunction, errorType: DeviceLogErrorType) => {
  switch (errorType) {
    case 'FILE_NOT_FOUND':
      return {
        title: t('Log file not found'),
        body: t(
          'The requested log file could not be found on the device. Verify the file path is correct and the logs exist on the device, then try again.',
        ),
      };
    case 'FILE_IS_DIRECTORY':
      return {
        title: t('Path is a directory'),
        body: t(
          'The specified path points to a directory, not a file. Enter the path to a specific log filter under {{basePath}}.',
          { basePath: DEVICE_LOG_BASE_PATH },
        ),
      };
    case 'NOT_A_TEXT_FILE':
      return {
        title: t('File is not readable'),
        body: t(
          'The specified file appears to be a binary file and cannot be displayed as text. Only text-based log files are supported.',
        ),
      };
    case 'FILE_TOO_LARGE':
      return {
        title: t('File too large'),
        body: t(
          'The requested file exceeds the maximum size limit and cannot be displayed. Try a smaller log file or use time-based filtering to narrow the results.',
        ),
      };
    case 'CONNECTION_ERROR':
      return {
        title: t('Failed to connect to device'),
        body: t('The connection to the device failed due to unknown reasons. Check the device status and try again.'),
      };
    case 'CONNECTION_CLOSED':
      return {
        title: t('Failed to connect to device'),
        body: t(
          'Unable to retrieve logs because a connection to the device could not be established or was lost. The device may be offline, rebooting, upgrading or otherwise unreachable. Check the device status and try again.',
        ),
      };
    // Uncontrolled errors are not part of the DeviceLogErrorType enum. We'll show the received error message
    default:
      return {
        title: t('Unable to retrieve logs'),
        body: t('Log retrieval failed. Review the error details below and adjust your search criteria.'),
        addDetails: true,
      };
  }
};

export const DeviceLogsEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyState headingLevel="h2" icon={CubesIcon} titleText={t('No logs loaded')} variant={EmptyStateVariant.lg}>
      <EmptyStateBody>
        {t(
          'Select a log category to specify which log to retrieve, then click Retrieve logs. You can optionally filter by time range, level or search term.',
        )}
      </EmptyStateBody>
    </EmptyState>
  );
};

export const DeviceLogsDisconnectedBanner = ({ onRetry }: { onRetry: VoidFunction }) => {
  const { t } = useTranslation();
  return (
    <Banner color="red" screenReaderText={t('Offline/ device lost connection')}>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem>{t('Offline/ device lost connection')}</FlexItem>
        <FlexItem>
          <Button variant="link" onClick={onRetry}>
            {t('Retry')}
          </Button>
        </FlexItem>
      </Flex>
    </Banner>
  );
};

export const DeviceLogsRetrievalError = ({ errorTypeOrMsg }: { errorTypeOrMsg: DeviceLogErrorType }) => {
  const { t } = useTranslation();

  const details = getErrorDetails(t, errorTypeOrMsg);
  return (
    <EmptyState
      headingLevel="h2"
      status="danger"
      icon={ExclamationCircleIcon}
      titleText={details.title}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <Stack hasGutter>
          <StackItem>{details.body}</StackItem>
          {details.addDetails && (
            <StackItem>
              <Content>{t('Error details:')}</Content>
              {errorTypeOrMsg}
            </StackItem>
          )}
        </Stack>
      </EmptyStateBody>
    </EmptyState>
  );
};
