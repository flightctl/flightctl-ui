import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import {
  Badge,
  EmptyState,
  EmptyStateHeader,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
} from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EnrollmentRequestList } from '@types';
import * as React from 'react';
import DeviceEnrollmentModal from './DeviceEnrollmentModal/DeviceEnrollmentModal';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { Link } from 'react-router-dom';
import { useDeleteListAction } from '../ListPage/ListPageActions';

const EnrollmentRequestEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>There are no enrollment requests yet</>} headingLevel="h4" />
  </EmptyState>
);

const EnrollmentRequestTable = () => {
  const [erList, loading, error, refetch] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: 'enrollmentrequests',
  });
  const { remove } = useFetch();
  const [requestId, setRequestId] = React.useState<string>();
  const [filters, setFilters] = React.useState<{ status: string[] }>({
    status: [],
  });
  const [isStatusExpanded, setIsStatusExpanded] = React.useState(false);
  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Enrollment request',
    onDelete: async (resourceId: string) => {
      await remove(`enrollmentrequests/${resourceId}`);
      refetch();
    },
  });

  const onStatusSelect = (event?: React.MouseEvent<Element, MouseEvent>, selection?: string | number) => {
    const checked = (event?.target as HTMLInputElement)?.checked;
    setFilters((filters) => ({
      ...filters,
      status: checked ? [...filters.status, selection as string] : filters.status.filter((s) => s !== selection),
    }));
  };

  const onDeleteGroup = (type: string) => {
    if (type === 'Status') {
      setFilters({ status: [] });
    }
  };

  const onDelete = (type: string, id: string) => {
    if (type === 'Status') {
      setFilters({ status: filters.status.filter((fil: string) => fil !== id) });
    } else {
      setFilters({ status: [] });
    }
  };

  const currentEnrollmentRequest = erList?.items.find((er) => er.metadata.name === requestId);

  const filteredData = erList?.items.filter((er) => {
    if (!filters.status.length) {
      return true;
    }
    return filters.status.includes(getApprovalStatus(er));
  });

  return (
    <ListPageBody data={erList?.items} loading={loading} error={error} emptyState={<EnrollmentRequestEmptyState />}>
      <Toolbar id="enrollment-toolbar" clearAllFilters={() => onDelete('', '')}>
        <ToolbarContent>
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
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                    isExpanded={isStatusExpanded}
                    style={
                      {
                        width: '140px',
                      } as React.CSSProperties
                    }
                  >
                    Status
                    {filters.status.length > 0 && <Badge isRead>{filters.status.length}</Badge>}
                  </MenuToggle>
                )}
                onSelect={onStatusSelect}
                selected={filters.status}
                isOpen={isStatusExpanded}
                onOpenChange={(isOpen) => setIsStatusExpanded(isOpen)}
              >
                <SelectList>
                  <SelectOption hasCheckbox value="Approved" isSelected={filters.status.includes('Approved')}>
                    Approved
                  </SelectOption>
                  <SelectOption hasCheckbox value="Pending" isSelected={filters.status.includes('Pending')}>
                    Pending
                  </SelectOption>
                  <SelectOption hasCheckbox value="Denied" isSelected={filters.status.includes('Denied')}>
                    Denied
                  </SelectOption>
                  <SelectOption hasCheckbox value="Unknown" isSelected={filters.status.includes('Unknown')}>
                    Unknown
                  </SelectOption>
                </SelectList>
              </Select>
            </ToolbarFilter>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Enrollment requests table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Creation timestamp</Th>
            <Th>Status</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {filteredData?.map((er) => {
            const approvalStatus = getApprovalStatus(er);
            return (
              <Tr key={er.metadata.name}>
                <Td dataLabel="Name">
                  <Link to={`/devicemanagement/enrollmentrequests/${er.metadata.name}`}>{er.metadata.name || '-'}</Link>
                </Td>
                <Td dataLabel="Creation timestamp">{er.metadata.creationTimestamp}</Td>
                <Td dataLabel="Status">{approvalStatus}</Td>
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Approve',
                        onClick: () => setRequestId(er.metadata.name),
                        isDisabled: approvalStatus !== 'Pending',
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
    </ListPageBody>
  );
};

const EnrollmentRequestList = () => (
  <ListPage title="Enrollment requests">
    <EnrollmentRequestTable />
  </ListPage>
);

export default EnrollmentRequestList;
