import { TFunction } from 'i18next';

const EMPTY_DATE = '0001-01-01T00:00:00Z';
const defaultLang = 'en-US';

const dateTimeFormatter = () =>
  new Intl.DateTimeFormat(defaultLang, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    year: 'numeric',
  });

const dateFormatter = () =>
  new Intl.DateTimeFormat(defaultLang, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getDateDisplay = (timestamp?: string) => {
  if (!timestamp) {
    return 'N/A';
  }

  return dateTimeFormatter().format(new Date(timestamp));
};

const getDateNoTimeDisplay = (timestamp?: string) => {
  if (!timestamp) {
    return 'N/A';
  }

  return dateFormatter().format(new Date(timestamp));
};

// https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export const timeSinceEpochText = (t: TFunction, epochOffset: number) => {
  const seconds = Math.floor((Date.now() - epochOffset) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return t('{{count}} years ago', { count: Math.floor(interval) });
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return t('{{count}} months ago', { count: Math.floor(interval) });
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return t('{{count}} days ago', { count: Math.floor(interval) });
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return t('{{count}} hours ago', { count: Math.floor(interval) });
  }
  interval = seconds / 60;
  if (interval > 1) {
    return t('{{count}} minutes ago', { count: Math.floor(interval) });
  }
  return t('just now');
};

const timeSinceText = (t: TFunction, timestampStr?: string) => {
  if (!timestampStr || timestampStr === EMPTY_DATE) {
    return 'N/A';
  }

  return timeSinceEpochText(t, new Date(timestampStr).getTime());
};

const getNextCalendarDay = (isoDate: string): string => {
  const y = Number(isoDate.slice(0, 4));
  const mo = Number(isoDate.slice(5, 7)) - 1;
  const d = Number(isoDate.slice(8, 10));
  const next = new Date(Date.UTC(y, mo, d) + 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
};

export { getNextCalendarDay, getDateDisplay, getDateNoTimeDisplay, timeSinceText };
