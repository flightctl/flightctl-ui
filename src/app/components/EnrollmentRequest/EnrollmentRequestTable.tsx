import { useFetch } from '@app/hooks/useFetch';
import { ApprovalStatus, getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import {
  Badge,
  MenuToggle,
  PageSection,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import { EnrollmentRequest } from '@types';
import * as React from 'react';
import DeviceEnrollmentModal from './DeviceEnrollmentModal/DeviceEnrollmentModal';
import { Link } from 'react-router-dom';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { useTableSort } from '@app/hooks/useTableSort';
import { getDateDisplay } from '@app/utils/dates';
import { sortByCreationTimestamp, sortByName } from '@app/utils/sort/generic';
import { sortERsByStatus } from '@app/utils/sort/enrollmentRequest';
import TableTextSearch, { TableTextSearchProps } from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';
import { useERFilters } from './useERFilters';

type EnrollmentRequestListToolbarProps = {
  search: TableTextSearchProps['value'];
  setSearch: TableTextSearchProps['setValue'];
  filters: { status: ApprovalStatus[] };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: ApprovalStatus[];
    }>
  >;
};

const EnrollmentRequestListToolbar: React.FC<EnrollmentRequestListToolbarProps> = ({
  search,
  setSearch,
  filters,
  setFilters,
}) => {
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
    <Toolbar id="enrollment-toolbar" clearAllFilters={onDelete}>
      <ToolbarContent>
        <ToolbarItem variant="search-filter">
          <TableTextSearch value={search} setValue={setSearch} placeholder="Search by fingerprint" />
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

const columns: TableColumn<EnrollmentRequest>[] = [
  {
    name: 'Fingerprint',
    onSort: sortByName,
  },
  {
    name: 'Status',
    defaultSort: true,
    onSort: sortERsByStatus,
  },
  {
    name: 'Created at',
    onSort: sortByCreationTimestamp,
  },
];

type EnrollmentRequestTableProps = {
  enrollmentRequests: EnrollmentRequest[];
  refetch: VoidFunction;
};

const EnrollmentRequestTable: React.FC<EnrollmentRequestTableProps> = ({ enrollmentRequests, refetch }) => {
  const { remove } = useFetch();
  const [requestId, setRequestId] = React.useState<string>();
  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Enrollment request',
    onDelete: async (resourceId: string) => {
      await remove(`enrollmentrequests/${resourceId}`);
      refetch();
    },
  });

  const currentEnrollmentRequest = enrollmentRequests.find((er) => er.metadata.name === requestId);

  const { filteredData, ...rest } = useERFilters(enrollmentRequests);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h3">Enrollment requests</Title>
      </PageSection>
      <EnrollmentRequestListToolbar {...rest} />
      <Table aria-label="Enrollment requests table" columns={columns} data={filteredData} getSortParams={getSortParams}>
        <Tbody>
          {sortedData.map((er) => {
            const approvalStatus = getApprovalStatus(er);
            return (
              <Tr key={er.metadata.name}>
                <Td dataLabel="Fingerprint">
                  <Link to={`/devicemanagement/enrollmentrequests/${er.metadata.name}`}>{er.metadata.name || '-'}</Link>
                </Td>
                <Td dataLabel="Status">{approvalStatus}</Td>
                <Td dataLabel="Created at">{getDateDisplay(er.metadata.creationTimestamp)}</Td>
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Approve',
                        onClick: () => setRequestId(er.metadata.name),
                        isDisabled: approvalStatus !== ApprovalStatus.Pending,
                      },
                      deleteAction({ resourceId: er.metadata.name || '' }),
                    ]}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {currentEnrollmentRequest && (
        <DeviceEnrollmentModal
          enrollmentRequest={currentEnrollmentRequest}
          onClose={(updateList) => {
            setRequestId(undefined);
            updateList && refetch();
          }}
        />
      )}
      {deleteModal}
    </>
  );
};

export default EnrollmentRequestTable;
