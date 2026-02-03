import fuzzy from 'fuzzysearch';
import { CORE_API_VERSION } from '../constants';

// Must be an even number for "getSearchResultsCount" to work
export const MAX_TOTAL_SEARCH_RESULTS = 10;

export const fuzzySeach = (filter: string | undefined, value?: string): boolean => {
  if (!filter) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return fuzzy(filter.toLowerCase(), value ? value.toLowerCase() : value) as boolean;
};

export const getSearchResultsCount = (labelCount: number, fleetCount: number) => {
  if (labelCount + fleetCount <= MAX_TOTAL_SEARCH_RESULTS) {
    return [labelCount, fleetCount];
  }
  const min = Math.min(labelCount, fleetCount, MAX_TOTAL_SEARCH_RESULTS / 2);
  if (min === MAX_TOTAL_SEARCH_RESULTS / 2) {
    return [MAX_TOTAL_SEARCH_RESULTS / 2, MAX_TOTAL_SEARCH_RESULTS / 2];
  }

  const rest = MAX_TOTAL_SEARCH_RESULTS - min;
  return labelCount === min ? [labelCount, rest] : [rest, fleetCount];
};

export const getEmptyFleetSearch = () => ({
  apiVersion: CORE_API_VERSION,
  kind: 'Fleet',
  metadata: {},
  items: [],
});
