import { TFunction } from 'i18next';

type ArgumentTypes = Parameters<typeof Intl.DateTimeFormat>;

const EMPTY_DATE = '0001-01-01T00:00:00Z';

// TODO use a date library and display dates according to user locale
const getDateDisplay = (timestamp?: string, withTime: boolean = false) => {
  if (!timestamp) {
    return 'N/A';
  }

  let options: ArgumentTypes[1];
  let timeStr = '';

  if (withTime) {
    options = { month: 'long', day: 'numeric' };
    timeStr = ` ${timestamp.slice(11, 16)}`;
  } else {
    options = { year: 'numeric', month: 'long', day: 'numeric' };
  }

  const date = new Date(timestamp);
  return `${new Intl.DateTimeFormat('en-GB', options).format(date)}${timeStr}`;
};

// https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
const timeSinceText = (t: TFunction, timestampStr?: string) => {
  if (!timestampStr || timestampStr === EMPTY_DATE) {
    return 'N/A';
  }

  const timestamp = new Date(timestampStr).getTime();
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

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

export { getDateDisplay, timeSinceText };
