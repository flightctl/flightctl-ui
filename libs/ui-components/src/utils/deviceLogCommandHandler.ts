import { DEVICE_LOGS_STREAM_FOOTER_PREFIX } from './deviceLogCommandBuilder';
import { DeviceLogFileErrorType, MAX_DEVICE_LOG_FILE_BYTES } from './deviceLogs';

type DeviceLogFileProbe = {
  exists: boolean;
  isFile: boolean;
  isValidSize: boolean;
  isValidMime: boolean;
};

type DeviceLogFileProbeBufferResult =
  | { status: 'incomplete' }
  | { status: 'script_failed'; exitCode: number }
  | { status: 'ready'; probe: DeviceLogFileProbe };

type IncrementalDeviceLogParseResult = {
  lines: string[];
  partialLine: string;
};

export class DeviceLogFileProbeError extends Error {
  constructor(public readonly errorType: DeviceLogFileErrorType) {
    super(errorType);
    this.name = 'DeviceLogFileProbeError';
  }
}

const isAllowedLogMimeType = (mime: string): boolean =>
  mime.startsWith('text/') ||
  mime === 'inode/x-empty' ||
  mime === 'application/json' ||
  mime === 'application/x-ndjson' ||
  /^application\/.+\+json$/.test(mime);

export const getProbeResult = (body: string): DeviceLogFileProbe => {
  const props: Record<string, string> = {};
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq);
    if (key !== 'exists' && key !== 'regular' && key !== 'size' && key !== 'mime') {
      continue;
    }
    props[key] = trimmed.slice(eq + 1);
  }

  const exists = props.exists === '1';
  const isFile = exists && props.regular === '1'; // checks whether the file is actually a file or a directory
  if (!exists) {
    return { exists: false, isFile, isValidSize: false, isValidMime: false };
  }

  // Since the file exists, we assume it's valid unless we can obtain its size and it is too large.
  let isValidSize = true;
  const sizeRaw = (props.size ?? '').trim();
  if (sizeRaw) {
    const n = Number.parseInt(sizeRaw, 10);
    const sizeBytes = Number.isNaN(n) ? null : n;
    if (sizeBytes !== null && sizeBytes > MAX_DEVICE_LOG_FILE_BYTES) {
      isValidSize = false;
    }
  }

  // Same for mime: only reject when we have an invalid mime type.
  let isValidMime = true;
  const mimeTrimmed = (props.mime ?? '').trim();
  if (mimeTrimmed.length > 0 && !isAllowedLogMimeType(mimeTrimmed)) {
    isValidMime = false;
  }

  return { exists: true, isFile, isValidSize, isValidMime };
};

/**
 * Parses a multiplexed log-session buffer for a completed file probe script.
 * Non-zero exit is surfaced as {@link DeviceLogFileProbeBufferResult.status} `script_failed`
 * so the UI can fail fast instead of waiting for a timeout.
 */
export const parseDeviceLogFileProbeBuffer = (buffer: string): DeviceLogFileProbeBufferResult => {
  const footer = parseLastDeviceLogStreamFooter(buffer);
  if (!footer) {
    return { status: 'incomplete' };
  }
  if (footer.exitCode !== 0) {
    return { status: 'script_failed', exitCode: footer.exitCode };
  }
  return { status: 'ready', probe: getProbeResult(footer.contentBeforeFooter) };
};

const parseLastDeviceLogStreamFooter = (buffer: string): { contentBeforeFooter: string; exitCode: number } | null => {
  const escapedPrefix = DEVICE_LOGS_STREAM_FOOTER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escapedPrefix}\\s+(\\d+)\\s*\\r?\\n?$`, 'gm');
  re.lastIndex = 0;
  let last: RegExpExecArray | undefined;
  let m: RegExpExecArray | null;
  while ((m = re.exec(buffer)) !== null) {
    last = m;
  }
  if (!last || last.index === undefined) {
    return null;
  }
  const exitCode = Number.parseInt(last[1], 10);
  if (Number.isNaN(exitCode)) {
    return null;
  }
  const contentBeforeFooter = buffer.slice(0, last.index).replace(/\r?\n$/, '');
  return { contentBeforeFooter, exitCode };
};

/**
 * When the remote script has finished, `buffer` contains a line
 * `{DEVICE_LOGS_STREAM_FOOTER_PREFIX} <exit>`. Returns parsed log lines and exit code, or null if incomplete.
 */
export const parseCompletedDeviceLogStreamBuffer = (buffer: string): { lines: string[]; exitCode: number } | null => {
  const footer = parseLastDeviceLogStreamFooter(buffer);
  if (!footer) {
    return null;
  }
  const lines = footer.contentBeforeFooter.split('\n').filter((line) => line.length > 0);
  return { lines, exitCode: footer.exitCode };
};

/**
 * Splits multiplexed stdout chunks into complete log lines for follow-mode streaming.
 * `partialLine` carries an incomplete trailing line across WebSocket frames.
 */
export const parseIncrementalDeviceLogStreamChunk = (
  chunk: string,
  partialLine: string,
): IncrementalDeviceLogParseResult => {
  const combined = partialLine + chunk;
  const segments = combined.split(/\r?\n/);
  const nextPartial = segments.pop() ?? '';
  const lines = segments.filter((line) => line.length > 0);
  return { lines, partialLine: nextPartial };
};
