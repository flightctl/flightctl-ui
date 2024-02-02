type ArgumentTypes = Parameters<typeof Intl.DateTimeFormat>;

const getDateDisplay = (timestamp: string) => {
  if (!timestamp) {
    return 'N/A';
  }
  const date = new Date(timestamp);
  const options = { year: 'numeric', month: 'long', day: 'numeric' } as ArgumentTypes[1];
  // TODO determine user locale
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};

export { getDateDisplay };
