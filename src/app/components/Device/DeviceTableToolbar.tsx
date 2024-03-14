import {
  Badge,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import TableTextSearch, { TableTextSearchProps } from '../Table/TableTextSearch';
import { ApprovalStatus } from '@app/utils/status/enrollmentRequest';

type DeviceTableToolbarProps = {
  search: TableTextSearchProps['value'];
  setSearch: TableTextSearchProps['setValue'];
  filters: { status: ApprovalStatus[] };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: ApprovalStatus[];
    }>
  >;
};

const DeviceTableToolbar: React.FC<DeviceTableToolbarProps> = ({ search, setSearch, filters, setFilters }) => {
  const [isStatusExpanded, setIsStatusExpanded] = React.useState(false);

  const onStatusSelect: SelectProps['onSelect'] = (e, selection) => {
    const checked = (e?.target as HTMLInputElement)?.checked;
    setFilters((filters) => ({
      ...filters,
      status: checked
        ? [...filters.status, selection as ApprovalStatus]
        : filters.status.filter((s) => s !== selection),
    }));
  };

  const onDeleteGroup = (type: string) => {
    if (type === 'Status') {
      setFilters({ status: [] });
    }
  };

  const onDelete = (type?: string, id?: string) => {
    if (type === 'Status') {
      setFilters({ status: filters.status.filter((fil: string) => fil !== id) });
    } else {
      setFilters({ status: [] });
      setSearch('');
    }
  };
  return (
    <Toolbar id="devices-toolbar" clearAllFilters={onDelete}>
      <ToolbarContent>
        <ToolbarItem variant="search-filter">
          <TableTextSearch value={search} setValue={setSearch} placeholder="Search by name or fingerprint" />
        </ToolbarItem>
        <ToolbarGroup variant="filter-group">
          <ToolbarFilter
            chips={filters.status}
            deleteChip={(category, chip) => onDelete(category as string, chip as string)}
            deleteChipGroup={(category) => onDeleteGroup(category as string)}
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
                {Object.keys(ApprovalStatus).map((key) => (
                  <SelectOption
                    key={key}
                    hasCheckbox
                    value={ApprovalStatus[key]}
                    isSelected={filters.status.includes(ApprovalStatus[key])}
                  >
                    {ApprovalStatus[key]}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </ToolbarFilter>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default DeviceTableToolbar;
