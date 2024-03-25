import {
  Badge,
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
  Toolbar,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import TableTextSearch, { TableTextSearchProps } from '../Table/TableTextSearch';
import { ApprovalStatus } from '@app/utils/status/enrollmentRequest';
import { DeviceConditionStatus } from '@app/utils/status/device';
import { combinedDevicesStatuses } from '@app/utils/status/devices';

type FilterCategory = 'Status' | 'Name / ID' | 'Fleet';

type DeviceTableToolbarProps = {
  search: TableTextSearchProps['value'];
  setSearch: TableTextSearchProps['setValue'];
  fleetName: string | undefined;
  setFleetName: (fleetName: string) => void;
  filters: { status: Array<DeviceConditionStatus | ApprovalStatus> };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: Array<DeviceConditionStatus | ApprovalStatus>;
    }>
  >;
  children: React.ReactNode;
};

const DeviceTableToolbar: React.FC<DeviceTableToolbarProps> = ({
  fleetName,
  setFleetName,
  search,
  setSearch,
  filters,
  setFilters,
  children,
}) => {
  const [isStatusExpanded, setIsStatusExpanded] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const fleetNameFilter = searchParams.get('fleetId');

  const onStatusSelect: SelectProps['onSelect'] = (e, selection) => {
    const checked = (e?.target as HTMLInputElement)?.checked;
    setFilters((filters) => ({
      ...filters,
      status: checked
        ? [...filters.status, selection as ApprovalStatus]
        : filters.status.filter((s) => s !== selection),
    }));
  };

  const clearFleetFilter = () => {
    setSearchParams('');
  };

  const onApplyFleetFilter = () => {
    // The change in the URL is detected by DeviceList. It will change the query to filter by fleet
    setSearchParams({ fleetId: fleetName || '' });
  };

  const onDeleteFilterGroup = (category: string | ToolbarChipGroup) => {
    const type = category as FilterCategory;
    if (type === 'Status') {
      setFilters({ status: [] });
    } else {
      setFilters({ status: [] });
      setSearch('');
      clearFleetFilter();
    }
  };

  const onDeleteFilterChip = (category: string | ToolbarChipGroup, chip: ToolbarChip | string) => {
    const type = category as FilterCategory;
    const id = chip as string;
    if (type === 'Status') {
      setFilters({ status: filters.status.filter((fil: string) => fil !== id) });
    } else if (type === 'Name / ID') {
      setSearch('');
    } else if (type === 'Fleet') {
      clearFleetFilter();
    }
  };

  return (
    <Toolbar id="devices-toolbar" clearAllFilters={() => onDeleteFilterGroup('')}>
      <ToolbarContent>
        <ToolbarItem variant="search-filter">
          <ToolbarFilter chips={search ? [search] : []} deleteChip={onDeleteFilterChip} categoryName="Name / ID">
            <TableTextSearch value={search} setValue={setSearch} placeholder="Search by name or fingerprint" />
          </ToolbarFilter>
        </ToolbarItem>
        <ToolbarItem variant="search-filter">
          <ToolbarFilter
            chips={fleetNameFilter ? [fleetNameFilter] : []}
            deleteChip={onDeleteFilterChip}
            categoryName="Fleet"
          >
            <SearchInput
              aria-label="Fleet name (exact match)"
              onChange={(_event, value) => setFleetName(value)}
              value={fleetNameFilter ? fleetName : undefined}
              placeholder="Fleet name (exact match)"
              onClear={clearFleetFilter}
              onSearch={onApplyFleetFilter}
            />
          </ToolbarFilter>
        </ToolbarItem>
        <ToolbarGroup variant="filter-group">
          <ToolbarFilter
            chips={filters.status}
            deleteChip={onDeleteFilterChip}
            deleteChipGroup={onDeleteFilterGroup}
            categoryName="Status"
          >
            <Select
              aria-label="Status"
              role="menu"
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                  isExpanded={isStatusExpanded}
                >
                  Status
                  {filters.status.length > 0 && <Badge isRead>{filters.status.length}</Badge>}
                </MenuToggle>
              )}
              onSelect={onStatusSelect}
              selected={filters.status}
              isOpen={isStatusExpanded}
              onOpenChange={setIsStatusExpanded}
            >
              <SelectList>
                {combinedDevicesStatuses.map((status) => (
                  <SelectOption
                    key={status.key}
                    hasCheckbox
                    value={status.label}
                    isSelected={filters.status.includes(status.label)}
                  >
                    {status.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </ToolbarFilter>
        </ToolbarGroup>
        {children}
      </ToolbarContent>
    </Toolbar>
  );
};

export default DeviceTableToolbar;
