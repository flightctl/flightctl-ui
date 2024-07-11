import fuzzy from 'fuzzysearch';

export const fuzzySeach = (filter: string | undefined, value?: string): boolean => {
  if (!filter) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return fuzzy(filter.toLowerCase(), value ? value.toLowerCase() : value) as boolean;
};
