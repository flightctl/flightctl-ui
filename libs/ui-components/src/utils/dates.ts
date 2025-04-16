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

const getDateDisplay = (timestamp?: string) => {
  if (!timestamp) {
    return 'N/A';
  }

  return dateTimeFormatter().format(new Date(timestamp));
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
  return t('< 1 minute ago');
};

const timeSinceText = (t: TFunction, timestampStr?: string) => {
  if (!timestampStr || timestampStr === EMPTY_DATE) {
    return 'N/A';
  }

  return timeSinceEpochText(t, new Date(timestampStr).getTime());
};

export { getDateDisplay, timeSinceText };
