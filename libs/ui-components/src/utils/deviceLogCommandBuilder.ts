import { getNextCalendarDay } from './dates';
import {
  DEVICE_LOG_BASE_PATH,
  DeviceLogCategory,
  DeviceLogLevel,
  DeviceLogLevelValue,
  type DeviceLogSearchParams,
  DeviceLogTimeRange,
  MAX_LOG_LINES,
  MAX_LOG_LINES_WHEN_STREAMING,
} from './deviceLogs';

const FLIGHTCTL_AGENT_UNIT = 'flightctl-agent.service';

export const DEVICE_LOGS_STREAM_FOOTER_PREFIX = '__FLIGHTCTL_DEVICE_LOGS_EOF__';

const LEVEL_TO_JOURNAL_PRIORITY: Record<DeviceLogLevel, string> = {
  [DeviceLogLevel.EMERGENCY]: 'emerg',
  [DeviceLogLevel.ALERT]: 'alert',
  [DeviceLogLevel.CRITICAL]: 'crit',
  [DeviceLogLevel.ERROR]: 'err',
  [DeviceLogLevel.WARNING]: 'warning',
  [DeviceLogLevel.NOTICE]: 'notice',
  [DeviceLogLevel.INFO]: 'info',
  [DeviceLogLevel.DEBUG]: 'debug',
};

const getPriorityOption = (level: DeviceLogLevelValue): string[] =>
  level === 'all' ? [] : ['-p', LEVEL_TO_JOURNAL_PRIORITY[level]];

const quoteShellArg = (a: string) => `'${a.replace(/'/g, `'\\''`)}'`;

const calendarDateFromInput = (dateStr: string | undefined): string | null => {
  if (!dateStr) {
    return null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : null;
};

const getTimeOption = (params: DeviceLogSearchParams): string[] => {
  if (!params.timeRange) {
    return [];
  }
  switch (params.timeRange) {
    case DeviceLogTimeRange.CURRENT_BOOT:
      return ['-b', '0'];
    case DeviceLogTimeRange.PREVIOUS_BOOT:
      return ['-b', '-1'];
    case DeviceLogTimeRange.LAST_7_DAYS:
      return ['--since', '7 days ago'];
    case DeviceLogTimeRange.LAST_24_HOURS:
      return ['--since', '24 hours ago'];
    case DeviceLogTimeRange.LAST_HOUR:
      return ['--since', '1 hour ago'];
    case DeviceLogTimeRange.CUSTOM_TIME_RANGE: {
      const args: string[] = [];

      const from = calendarDateFromInput(params.dateFrom);
      if (from) {
        args.push('--since', from);
      }

      const to = calendarDateFromInput(params.dateTo);
      if (to) {
        // `--until` is exclusive; the end date chosen in the UI is inclusive, so we pass the following calendar day.
        args.push('--until', getNextCalendarDay(to));
      }
      return args;
    }
    default:
      return [];
  }
};

const getCategoryOption = (params: DeviceLogSearchParams): string[] => {
  switch (params.category) {
    case DeviceLogCategory.AGENT:
      return ['-u', FLIGHTCTL_AGENT_UNIT];
    case DeviceLogCategory.SYSTEM: {
      const unit = params.systemdUnit;
      return unit ? ['-u', unit] : [];
    }
    default:
      return [];
  }
};

/*
Builds the command to retrieve the logs from the journal.
We always include a max number of lines to retrieve, to prevent the command from timing out.

- Snapshot: journalctl <filters> --no-pager | tail -n <maxLines>
 "-n <maxLines>" cannot be used here because the lines are fetched before the filters are applied.

- Live: journalctl <filters> --no-pager -f -n <maxLines>
 "tail -n <maxLines>" cannot be used here because it doesn't support the follow mode.
*/
const buildJournalCommand = (params: DeviceLogSearchParams): string => {
  const unitArgs = getCategoryOption(params);
  const timeArgs = getTimeOption(params);
  const priorityArgs = getPriorityOption(params.level);

  const journalArgs = [...unitArgs, ...timeArgs, ...priorityArgs, '--no-pager'];
  const journalCmd = `journalctl ${journalArgs.map(quoteShellArg).join(' ')}`;

  if (params.showLiveLogs) {
    return `${journalCmd} -f -n ${MAX_LOG_LINES_WHEN_STREAMING}`;
  }

  // Run the command under "bash -c" so journalctl and tail are executed together.
  return `bash -c ${quoteShellArg(`${journalCmd} 2>&1 | tail -n ${MAX_LOG_LINES}`)}`;
};

/*
Builds the command to retrieve the content from a log file (must be under DEVICE_LOG_BASE_PATH)
We always include a max number of lines to retrieve, to prevent the command from timing out.

- Command: tail <followOption> -n <maxLines> <pathToFile>

*/
const buildFileCommand = (params: DeviceLogSearchParams): string => {
  if (!params.logFilePath) {
    throw new Error('A log file path is required.');
  }

  const options = ['tail'];
  if (params.showLiveLogs) {
    options.push('-F');
    options.push('-n', String(MAX_LOG_LINES_WHEN_STREAMING));
  } else {
    options.push('-n', String(MAX_LOG_LINES));
  }
  options.push(`${DEVICE_LOG_BASE_PATH}/${params.logFilePath.trim()}`);
  return options.map(quoteShellArg).join(' ');
};

/**
 * Builds stdin command for `bash -s` to obtain the desired logs based on the search form.
 * The commands are sent to a non-interactive session as `flightctl-console` via `sudo`.
 *
 * `2>&1` merges stderr into stdout so messages from `sudo` or `journalctl` on stderr
 * are still interleaved with log lines on the same multiplex stream the UI reads.
 *
 * A footer line `${DEVICE_LOGS_STREAM_FOOTER_PREFIX} <exit>` is printed after the command
 * so the UI can buffer multiplex chunks until the full output is available and treat
 * non-zero exit as an error (e.g. `tail` on a directory).
 */
const wrapDeviceLogsShellCommand = (innerCommand: string): string =>
  `sudo --non-interactive ${innerCommand} 2>&1
printf '%s %s\\n' '${DEVICE_LOGS_STREAM_FOOTER_PREFIX}' "$?"
`;

/** Follow-mode commands run until the session ends; no footer line is emitted. */
const wrapLiveDeviceLogsShellCommand = (innerCommand: string): string =>
  `sudo --non-interactive ${innerCommand} 2>&1
`;

/**
 * Runs a bash script that prints `exists`, `regular`, `stat` size, and `file` MIME for a path under DEVICE_LOG_BASE_PATH.
 *
 * If the stat/file tools are missing, the script will print empty `size` and `mime` values.
 * We'll only consider the probe failed when we obtain all the information we requested.
 */
const getDeviceLogFileProbeInnerCommand = (params: DeviceLogSearchParams): string => {
  if (!params.logFilePath) {
    throw new Error('A log file path is required.');
  }

  const path = quoteShellArg(`${DEVICE_LOG_BASE_PATH}/${params.logFilePath.trim()}`);

  const bashScript = [
    'path=$1',
    '[[ -e "$path" ]] && echo "exists=1" || echo "exists=0"',
    '[[ -f "$path" ]] && echo "regular=1" || echo "regular=0"',
    'echo "size=$(stat -c %s -- "$path" 2>/dev/null)"',
    'echo "mime=$(file -b --mime-type -- "$path" 2>/dev/null)"',
  ].join('\n');

  return `bash -c ${quoteShellArg(bashScript)} bash ${path}`;
};

export const getFileProbeCommand = (params: DeviceLogSearchParams): string =>
  wrapDeviceLogsShellCommand(getDeviceLogFileProbeInnerCommand(params));

export const getRetrieveLogContentCommand = (params: DeviceLogSearchParams): string => {
  const command = params.category === DeviceLogCategory.FILE ? buildFileCommand(params) : buildJournalCommand(params);
  return params.showLiveLogs ? wrapLiveDeviceLogsShellCommand(command) : wrapDeviceLogsShellCommand(command);
};
