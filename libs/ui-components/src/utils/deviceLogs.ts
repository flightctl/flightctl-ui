import * as Yup from 'yup';
import { TFunction } from 'react-i18next';

import { relativePathRegex } from '../components/form/validations';

export const DEVICE_LOG_BASE_PATH = '/var/log';

// Conservative estimate of average log line size.
const AVERAGE_LOG_LINE_BYTES = 250;
export const MAX_LOG_LINES = 100000;
export const MAX_LOG_LINES_WHEN_STREAMING = 10000;
// Approximate max payload size: ~25MB.
export const MAX_DEVICE_LOG_FILE_BYTES = MAX_LOG_LINES * AVERAGE_LOG_LINE_BYTES;

const MAX_SYSTEMD_UNIT_LENGTH = 256;
const MAX_LOG_FILE_PATH_LENGTH = 4096;
const FILTER_ALL_VALUE = 'all';

const SYSTEMD_UNIT_INPUT_PATTERN = /^[a-zA-Z0-9:@._-]+$/;

export type DeviceLogFileErrorType = 'FILE_NOT_FOUND' | 'FILE_IS_DIRECTORY' | 'NOT_A_TEXT_FILE' | 'FILE_TOO_LARGE';
export type DeviceLogTransportErrorType = 'TIMEOUT' | 'CONNECTION_CLOSED' | 'CONNECTION_ERROR';

export type DeviceLogErrorType = DeviceLogFileErrorType | DeviceLogTransportErrorType;

export enum DeviceLogCategory {
  AGENT = 'agent',
  SYSTEM = 'system',
  FILE = 'file',
}

export enum DeviceLogTimeRange {
  LAST_HOUR = '1-hour',
  LAST_24_HOURS = '24-hours',
  LAST_7_DAYS = '7-days',
  CURRENT_BOOT = 'current-boot',
  PREVIOUS_BOOT = 'previous-boot',
  CUSTOM_TIME_RANGE = 'custom-range',
}

export enum DeviceLogLevel {
  EMERGENCY = 'emergency',
  ALERT = 'alert',
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

export type DeviceLogLevelValue = DeviceLogLevel | typeof FILTER_ALL_VALUE;

export type DeviceLogSearchParams = {
  category: DeviceLogCategory;
  level: DeviceLogLevel | typeof FILTER_ALL_VALUE;

  // For "Custom" time range: optional journal bounds as `YYYY-MM-DD` (date input); at least one must be set.
  timeRange: DeviceLogTimeRange | typeof FILTER_ALL_VALUE;
  dateFrom: string;
  dateTo: string;
  // For System logs, optional unit name (eg. sshd.service)
  systemdUnit: string;
  // For File logs, relative path under DEVICE_LOG_BASE_PATH (/var/log)
  logFilePath: string;
  /** When true, logs are streamed in follow mode instead of a one-shot snapshot. */
  showLiveLogs: boolean;
};

export const DEVICE_LOGS_FORM_INITIAL_VALUES: DeviceLogSearchParams = {
  category: DeviceLogCategory.AGENT,
  timeRange: FILTER_ALL_VALUE,
  level: FILTER_ALL_VALUE,
  dateFrom: '',
  dateTo: '',
  systemdUnit: '',
  logFilePath: '',
  showLiveLogs: false,
};

/** Resets log search fields to defaults while keeping the selected log category. */
export const getDeviceLogsFormResetValues = (category: DeviceLogCategory): DeviceLogSearchParams => ({
  ...DEVICE_LOGS_FORM_INITIAL_VALUES,
  category,
});

export const getDeviceLogCategoryLabel = (t: TFunction, category: DeviceLogCategory): string => {
  switch (category) {
    case DeviceLogCategory.AGENT:
      return t('Agent');
    case DeviceLogCategory.SYSTEM:
      return t('System');
    case DeviceLogCategory.FILE:
      return t('File path');
  }
};

export const getDeviceLogTimeRangeLabel = (t: TFunction, timeRange: DeviceLogTimeRange): string => {
  switch (timeRange) {
    case DeviceLogTimeRange.LAST_HOUR:
      return t('Last 1 hour');
    case DeviceLogTimeRange.LAST_24_HOURS:
      return t('Last 24 hours');
    case DeviceLogTimeRange.LAST_7_DAYS:
      return t('Last 7 days');
    case DeviceLogTimeRange.CURRENT_BOOT:
      return t('Current boot');
    case DeviceLogTimeRange.PREVIOUS_BOOT:
      return t('Previous boot');
    case DeviceLogTimeRange.CUSTOM_TIME_RANGE:
      return t('Custom range');
  }
};

export const formatDeviceLogCustomTimeRangeText = (t: TFunction, dateFrom: string, dateTo: string): string => {
  if (dateFrom && dateTo) {
    return t('{{dateFrom}} to {{dateTo}}', { dateFrom, dateTo });
  }
  if (dateFrom) {
    return t('Since {{dateFrom}}', { dateFrom });
  }
  if (dateTo) {
    return t('Until {{dateTo}}', { dateTo });
  }
  return '';
};

export const getActiveTimeFilterLabel = (t: TFunction, params: DeviceLogSearchParams): string | null => {
  if (params.timeRange === FILTER_ALL_VALUE) {
    return null;
  }
  if (params.timeRange === DeviceLogTimeRange.CUSTOM_TIME_RANGE) {
    if (!params.dateFrom && !params.dateTo) {
      return null;
    }
    return formatDeviceLogCustomTimeRangeText(t, params.dateFrom, params.dateTo);
  }

  return getDeviceLogTimeRangeLabel(t, params.timeRange);
};

export const getDeviceLogLevelLabel = (t: TFunction, level: DeviceLogLevel): string => {
  switch (level) {
    case DeviceLogLevel.EMERGENCY:
      return t('Only emergency');
    case DeviceLogLevel.ALERT:
      return t('Alert and above');
    case DeviceLogLevel.CRITICAL:
      return t('Critical and above');
    case DeviceLogLevel.ERROR:
      return t('Error and above');
    case DeviceLogLevel.WARNING:
      return t('Warning and above');
    case DeviceLogLevel.NOTICE:
      return t('Notice and above');
    case DeviceLogLevel.INFO:
      return t('Info and above');
    case DeviceLogLevel.DEBUG:
      return t('Debug and above');
  }
};

export const getDeviceLogSearchSchema = (t: TFunction) => {
  return Yup.object({
    category: Yup.string().oneOf(Object.values(DeviceLogCategory)).required(),
    timeRange: Yup.string().oneOf([...Object.values(DeviceLogTimeRange), FILTER_ALL_VALUE]),
    // "dateFrom" and "dateTo" don't need additional validations (DeviceLogsTimeRangeField allows only valid selections).
    dateFrom: Yup.string(),
    dateTo: Yup.string(),
    level: Yup.string().oneOf([...Object.values(DeviceLogLevel), FILTER_ALL_VALUE]),
    systemdUnit: Yup.string()
      .max(MAX_SYSTEMD_UNIT_LENGTH, t('Must be at most {{max}} characters.', { max: MAX_SYSTEMD_UNIT_LENGTH }))
      .when('category', {
        is: DeviceLogCategory.SYSTEM,
        then: (schema) =>
          schema.test(
            'systemd-unit-token',
            t(
              'Enter a single unit name using alphanumeric characters, colons (:), at signs (@), dots (.), underscores (_), and hyphens (-).',
            ),
            (value) => {
              if (!value) {
                return true;
              }
              return SYSTEMD_UNIT_INPUT_PATTERN.test(value);
            },
          ),
        otherwise: (schema) => schema,
      }),
    showLiveLogs: Yup.boolean(),
    logFilePath: Yup.string().when('category', {
      is: DeviceLogCategory.FILE,
      then: (schema) =>
        schema
          .required(t('Log file path is required.'))
          .matches(
            relativePathRegex,
            t(
              'Log file path must be relative to {{basePath}}. It cannot be absolute or point outside the log directory.',
              { basePath: DEVICE_LOG_BASE_PATH },
            ),
          )
          .test(
            'log-file-path-no-trailing-slash',
            t('Log file path must not end with "/". Enter a file path, not a directory.'),
            (value) => typeof value === 'string' && !value.endsWith('/'),
          )
          .max(MAX_LOG_FILE_PATH_LENGTH, t('Must be at most {{max}} characters.', { max: MAX_LOG_FILE_PATH_LENGTH })),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
};
