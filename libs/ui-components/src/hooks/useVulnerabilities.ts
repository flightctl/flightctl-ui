import * as React from 'react';
import { OnSort, SortByDirection } from '@patternfly/react-table';
import { useDebounce } from 'use-debounce';
import type { Vulnerability, VulnerabilityGroupList, VulnerabilityList } from '@flightctl/types/alpha';

import { useFetchPeriodically } from './useFetchPeriodically';
import { useTablePagination } from './useTablePagination';
import { PAGE_SIZE } from '../constants';

export type VulnerabilitySortField = 'name' | 'severity';
export type VulnerabilitySortDirection = 'asc' | 'desc';

type VulnerabilityApiList = VulnerabilityGroupList | VulnerabilityList;

type UseVulnerabilitiesResult<TList extends VulnerabilityApiList> = {
  vulnerabilities: TList['items'];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemCount: number;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedSeverities: Vulnerability.severity[];
  setSelectedSeverities: React.Dispatch<React.SetStateAction<Vulnerability.severity[]>>;
  sortBy: VulnerabilitySortField;
  onSort: OnSort;
  sortDirection: VulnerabilitySortDirection;
  error: unknown;
  isLoading: boolean;
  isUpdating: boolean;
};

type UseVulnerabilitiesArgs = {
  endpoint?: string;
};

const FILTER_DEBOUNCE_MS = 1000;

const severitySelectionKey = (severities: Vulnerability.severity[]): string => [...severities].sort().join('\0');

// The cveId must not contain spaces or other special characters, otherwise API fails with error 400.
// Additionally, we make the search case-insensitive, as cveIds are always in the form "CVE-<YEAR>-<NUMBER>".
const toApiSearchCveId = (search: string): string => {
  const normalized = search.replace(/%/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized.length ? normalized.toUpperCase() : '';
};

type VulnerabilitiesListEndpointArgs = {
  endpoint: string;
  nextContinue: string;
  search: string;
  selectedSeverities: Vulnerability.severity[];
  sortBy: VulnerabilitySortField;
  sortDirection: VulnerabilitySortDirection;
};

const getVulnerabilityListFieldSelector = (search: string, severities: Vulnerability.severity[]) => {
  const selectors: string[] = [];

  const cveIdSearch = toApiSearchCveId(search);
  if (cveIdSearch) {
    selectors.push(`cveId contains ${cveIdSearch}`);
  }

  if (severities.length === 1) {
    selectors.push(`severity=${severities[0]}`);
  } else if (severities.length > 1) {
    selectors.push(`severity in (${severities.join(',')})`);
  }
  return selectors.length === 0 ? undefined : selectors.join(',');
};

const getVulnerabilitiesListEndpoint = ({
  endpoint,
  nextContinue,
  search,
  selectedSeverities,
  sortBy,
  sortDirection,
}: VulnerabilitiesListEndpointArgs): string => {
  const params = new URLSearchParams();
  params.set('limit', String(PAGE_SIZE));
  params.set('sortBy', sortBy === 'name' ? 'cveId' : 'severity');
  params.set('order', sortDirection);

  const fieldSelector = getVulnerabilityListFieldSelector(search, selectedSeverities);
  if (fieldSelector) {
    params.set('fieldSelector', fieldSelector);
  }
  if (nextContinue) {
    params.set('continue', nextContinue);
  }
  return `${endpoint}?${params.toString()}`;
};

export const useVulnerabilities = <TList extends VulnerabilityApiList = VulnerabilityGroupList>({
  endpoint = 'vulnerabilities',
}: UseVulnerabilitiesArgs = {}): UseVulnerabilitiesResult<TList> => {
  const [search, setSearch] = React.useState<string>('');
  const [debouncedSearch] = useDebounce(search.trim(), FILTER_DEBOUNCE_MS);
  const [selectedSeverities, setSelectedSeverities] = React.useState<Vulnerability.severity[]>([]);
  const [debouncedSelectedSeverities] = useDebounce(selectedSeverities, FILTER_DEBOUNCE_MS);

  const vulnerabilitiesDebouncing =
    search.trim() !== debouncedSearch ||
    severitySelectionKey(selectedSeverities) !== severitySelectionKey(debouncedSelectedSeverities);
  const [sortBy, setSortField] = React.useState<VulnerabilitySortField>('severity');
  const [sortDirection, setSortDirection] = React.useState<VulnerabilitySortDirection>('desc');

  const { currentPage, setCurrentPage, nextContinue, onPageFetched, itemCount } = useTablePagination<TList>();

  React.useLayoutEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedSelectedSeverities, sortBy, sortDirection]);

  const resolvedEndpoint = React.useMemo(
    () =>
      getVulnerabilitiesListEndpoint({
        endpoint,
        nextContinue,
        search: debouncedSearch,
        selectedSeverities: debouncedSelectedSeverities,
        sortBy,
        sortDirection,
      }),
    [endpoint, nextContinue, debouncedSearch, debouncedSelectedSeverities, sortBy, sortDirection],
  );

  const [listRes, listLoading, listError, , updating] = useFetchPeriodically<TList>(
    {
      endpoint: resolvedEndpoint,
    },
    onPageFetched,
  );

  const onSort = React.useCallback<OnSort>(
    (_event, columnIndex, sortByDirection) => {
      const field: VulnerabilitySortField = columnIndex === 0 ? 'name' : 'severity';
      const direction: VulnerabilitySortDirection = sortByDirection === SortByDirection.asc ? 'asc' : 'desc';

      if (sortBy !== field) {
        setSortField(field);
        setSortDirection(field === 'severity' ? 'desc' : 'asc');
        return;
      }

      setSortDirection(direction);
    },
    [sortBy],
  );

  return {
    vulnerabilities: listRes?.items ?? [],
    currentPage,
    setCurrentPage,
    itemCount,
    search,
    setSearch,
    selectedSeverities,
    setSelectedSeverities,
    sortBy,
    sortDirection,
    onSort,
    isLoading: listLoading,
    error: listError,
    isUpdating: updating || vulnerabilitiesDebouncing,
  };
};
