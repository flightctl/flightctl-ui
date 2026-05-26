import { DeviceLogCategory, DeviceLogSearchParams } from './deviceLogs';

// Maximum length for the final download filename. Typical per-name filesystem limits are 255.
const MAX_DOWNLOAD_FILENAME_LENGTH = 255;
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;

const sanitizeFilename = (value: string) =>
  value
    .replace(INVALID_FILENAME_CHARS, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

const fileNameFits = (filename: string) => filename.length <= MAX_DOWNLOAD_FILENAME_LENGTH;

export const buildDownloadFilename = (prefix: string, params: DeviceLogSearchParams): string => {
  const commonParts: string[] = [prefix, params.category];

  const allParts: string[] = [...commonParts];
  let variablePart = '';
  if (params.category === DeviceLogCategory.FILE) {
    variablePart = params.logFilePath.split('/').pop() || '';
  } else if (params.category === DeviceLogCategory.SYSTEM) {
    variablePart = params.systemdUnit;
  }
  allParts.push(sanitizeFilename(variablePart));

  // Return the filename staying within the desired character limit
  const baseFilename = allParts.join('-');
  const withTimestamp = `${baseFilename}-${Date.now()}`;
  if (fileNameFits(withTimestamp)) {
    return withTimestamp;
  }
  if (fileNameFits(baseFilename)) {
    return baseFilename;
  }
  return commonParts.join('-');
};

export const formatDeviceLogsForExport = (logs: string[]): string => (logs.length > 0 ? `${logs.join('\n')}\n` : '');

const createTextPlainBlobUrl = (content: string): string => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(blob);
};

/** Opens plain-text log content in a new browser tab. Returns false if the popup was blocked. */
export const openTextInNewTab = (content: string): boolean => {
  const url = createTextPlainBlobUrl(content);
  const tab = window.open(url, '_blank');
  if (!tab) {
    URL.revokeObjectURL(url);
    return false;
  }
  tab.opener = null;
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
  return true;
};

export const downloadTextAsFile = (content: string, filename: string): void => {
  const url = createTextPlainBlobUrl(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};
