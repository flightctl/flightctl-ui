import * as React from 'react';
import { SelectList, SelectOption, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import type { OnSort } from '@patternfly/react-table';
import type {
  Vulnerability,
  VulnerabilityGroup,
  VulnerabilityGroupList,
  VulnerabilityList,
} from '@flightctl/types/alpha';

import { PaginationDetails } from '../../hooks/useTablePagination';
import { useTranslation } from '../../hooks/useTranslation';
import { VulnerabilitySortDirection, VulnerabilitySortField } from '../../hooks/useVulnerabilities';
import { useAffectedImagesExpand } from '../../hooks/useAffectedImagesExpand';
import { VULNERABILITY_SEVERITY_ORDER } from '../../utils/vulnerabilities';
import { getVulnerabilitySeverityStatusItems } from '../../utils/status/vulnerabilities';
import FilterSelect from '../form/FilterSelect';
import Table, { ApiTableColumn } from '../Table/Table';
import TableTextSearch from '../Table/TableTextSearch';
import TablePagination from '../Table/TablePagination';
import FlightCtlPageDrawer from '../common/FlightCtlPageDrawer';
import StatusDisplay from '../Status/StatusDisplay';
import { VulnerabilitiesTableCompactRow, VulnerabilitiesTableFullRow } from './VulnerabilitiesTableRow';
import VulnerabilityDetailsDrawer from './VulnerabilityDetailsDrawer';

type VulnerabilitySeverity = Vulnerability['severity'];

type VulnerabilitiesTableCommonProps = {
  isUpdating?: boolean;
  selectedSeverities: VulnerabilitySeverity[];
  setSelectedSeverities: React.Dispatch<React.SetStateAction<VulnerabilitySeverity[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  sortBy: VulnerabilitySortField;
  sortDirection: VulnerabilitySortDirection;
  onSort: OnSort;
  fleetName?: string;
  pagination: Pick<
    PaginationDetails<VulnerabilityGroupList | VulnerabilityList>,
    'currentPage' | 'setCurrentPage' | 'itemCount'
  >;
};

type VulnerabilitiesTableSingleDeviceProps = VulnerabilitiesTableCommonProps & {
  isSingleDevice: true;
  vulnerabilities: Vulnerability[];
};

type VulnerabilitiesTableGroupedProps = VulnerabilitiesTableCommonProps & {
  isSingleDevice: false;
  vulnerabilities: VulnerabilityGroup[];
};

type VulnerabilitiesTableRowsProps<T extends Vulnerability | VulnerabilityGroup> = {
  vulnerabilities: T[];
  setSelectedRow: (vulnerability: T) => void;
};

const VulnerabilitiesTableCompactRows = ({
  vulnerabilities,
  setSelectedRow,
}: VulnerabilitiesTableRowsProps<Vulnerability>) =>
  vulnerabilities.map((vuln) => (
    <VulnerabilitiesTableCompactRow key={vuln.cveId} vulnerability={vuln} setSelectedRow={() => setSelectedRow(vuln)} />
  ));

const VulnerabilitiesTableFullRows = ({
  vulnerabilities,
  setSelectedRow,
}: VulnerabilitiesTableRowsProps<VulnerabilityGroup>) => {
  const { getCompoundExpand, isExpandedForRowKey } = useAffectedImagesExpand({
    columnIndex: 3,
  });

  return vulnerabilities.map((vuln, rowIndex) => (
    <VulnerabilitiesTableFullRow
      key={vuln.cveId}
      vulnerability={vuln}
      setSelectedRow={() => setSelectedRow(vuln)}
      imagesExpanded={isExpandedForRowKey(vuln.cveId)}
      compoundExpand={getCompoundExpand(vuln.cveId, rowIndex)}
    />
  ));
};

const VulnerabilitiesTable = ({
  isUpdating = false,
  vulnerabilities,
  isSingleDevice,
  selectedSeverities,
  setSelectedSeverities,
  search,
  setSearch,
  sortBy,
  sortDirection,
  onSort,
  pagination,
  fleetName,
}: VulnerabilitiesTableSingleDeviceProps | VulnerabilitiesTableGroupedProps) => {
  const { t } = useTranslation();

  const hasFiltersEnabled = selectedSeverities.length > 0 || search.trim() !== '';
  const clearAllFilters = React.useCallback(() => {
    setSearch('');
    setSelectedSeverities([]);
  }, [setSearch, setSelectedSeverities]);

  const [selectedRow, setSelectedRow] = React.useState<Vulnerability | VulnerabilityGroup>();

  const toggleSeverityFilter = React.useCallback(
    (severity: VulnerabilitySeverity) => {
      setSelectedSeverities((currentFilters) => {
        if (currentFilters.includes(severity)) {
          return currentFilters.filter((selectedSeverity) => selectedSeverity !== severity);
        }

        return currentFilters.concat(severity);
      });
    },
    [setSelectedSeverities],
  );

  React.useEffect(() => {
    if (!selectedRow) {
      return;
    }

    const current = vulnerabilities.find((row) => row.cveId === selectedRow.cveId);
    setSelectedRow(current ?? undefined);
  }, [selectedRow, vulnerabilities]);

  const activeSortIndex = sortBy === 'name' ? 0 : 1;
  const sortByState = React.useMemo(
    () => ({
      index: activeSortIndex,
      direction: sortDirection,
    }),
    [activeSortIndex, sortDirection],
  );

  const tableColumns = React.useMemo(() => {
    const baseColumns: ApiTableColumn[] = [
      {
        name: t('Name'),
        thProps: {
          sort: {
            sortBy: sortByState,
            onSort,
            columnIndex: 0,
          },
        },
      },
      {
        name: t('Severity'),
        thProps: {
          sort: {
            sortBy: sortByState,
            onSort,
            columnIndex: 1,
          },
        },
      },
    ];
    if (!isSingleDevice) {
      baseColumns.push({ name: t('Affected devices') });
      baseColumns.push({ name: t('Affected images') });
    }
    baseColumns.push({ name: t('Published') });
    return baseColumns;
  }, [t, isSingleDevice, sortByState, onSort]);

  const emptyData = vulnerabilities.length === 0;

  const severityItems = getVulnerabilitySeverityStatusItems(t);

  return (
    <>
      {selectedRow && (
        <FlightCtlPageDrawer
          isExpanded
          panelContent={
            <VulnerabilityDetailsDrawer
              vulnerability={selectedRow}
              isSingleDevice={isSingleDevice}
              fleetName={fleetName}
              onClose={() => setSelectedRow(undefined)}
            />
          }
        />
      )}

      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <FilterSelect
                placeholder={t('Filter by severity')}
                selectedFilters={selectedSeverities.length}
                isFilterUpdating={isUpdating}
              >
                <SelectList>
                  {VULNERABILITY_SEVERITY_ORDER.map((severity) => {
                    // The status displayed in the filter is different that the normal Severity status
                    // (in the filter, the outline border is not shown)
                    const item = severityItems.find((item) => item.id === severity);
                    return (
                      <SelectOption
                        key={severity}
                        value={severity}
                        hasCheckbox
                        isSelected={selectedSeverities.includes(severity)}
                        onClick={() => toggleSeverityFilter(severity)}
                      >
                        <StatusDisplay item={item} />
                      </SelectOption>
                    );
                  })}
                </SelectList>
              </FilterSelect>
            </ToolbarItem>
            <ToolbarItem>
              <TableTextSearch value={search} setValue={setSearch} placeholder={t('Find by name')} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Vulnerabilities table')}
        loading={isUpdating}
        columns={tableColumns}
        hasFilters={hasFiltersEnabled}
        emptyData={emptyData}
        clearFilters={clearAllFilters}
      >
        {isSingleDevice ? (
          <VulnerabilitiesTableCompactRows vulnerabilities={vulnerabilities} setSelectedRow={setSelectedRow} />
        ) : (
          <VulnerabilitiesTableFullRows vulnerabilities={vulnerabilities} setSelectedRow={setSelectedRow} />
        )}
      </Table>
      <TablePagination isUpdating={isUpdating} pagination={pagination} />
    </>
  );
};

export default VulnerabilitiesTable;
