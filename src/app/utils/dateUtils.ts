type ArgumentTypes = Parameters<typeof Intl.DateTimeFormat>;

// TODO use a date library and display dates according to user locale
const getDateDisplay = (timestamp: string, withTime: boolean = false) => {
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

export { getDateDisplay };
