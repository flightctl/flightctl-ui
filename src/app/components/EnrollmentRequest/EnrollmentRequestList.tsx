import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import {
  Alert,
  Badge,
  Bullseye,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  PageSectionVariants,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
} from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EnrollmentRequestList } from '@types';
import * as React from 'react';
import DeviceEnrollmentModal from './DeviceEnrollmentModal/DeviceEnrollmentModal';

const EnrollmentRequestTable = () => {
  const [erList, loading, error, refetch] = useFetchPeriodically<EnrollmentRequestList>('enrollmentrequests');
  const { remove } = useFetch();
  const [requestId, setRequestId] = React.useState<string>();
  const [filters, setFilters] = React.useState<{ status: string[] }>({
    status: [],
  });
  const [isStatusExpanded, setIsStatusExpanded] = React.useState(false);

  if (error) {
    return <Alert variant="danger" title="An error occured" isInline />;
  }

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

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

  const currentEnrollementRequest = erList?.items.find((er) => er.metadata.name === requestId);

  const filteredData = erList?.items.filter((er) => {
    if (!filters.status.length) {
      return true;
    }
    return filters.status.includes(getApprovalStatus(er));
  });

  return (
    !!filteredData && (
      <>
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
                    <SelectOption
                      hasCheckbox
                      key="statusApproved"
                      value="Approved"
                      isSelected={filters.status.includes('Approved')}
                    >
                      Approved
                    </SelectOption>
                    <SelectOption
                      hasCheckbox
                      key="statusPending"
                      value="Pending"
                      isSelected={filters.status.includes('Pending')}
                    >
                      Pending
                    </SelectOption>
                    <SelectOption
                      hasCheckbox
                      key="statusDenied"
                      value="Denied"
                      isSelected={filters.status.includes('Denied')}
                    >
                      Denied
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
            {filteredData.map((er) => {
              const approvalStatus = getApprovalStatus(er);
              return (
                <Tr key={er.metadata.name}>
                  <Td dataLabel="Name">{er.metadata.name}</Td>
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
                        {
                          title: 'Delete',
                          onClick: async () => {
                            await remove(`enrollmentrequests/${er.metadata.name}`);
                            refetch();
                          },
                        },
                      ]}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {currentEnrollementRequest && (
          <DeviceEnrollmentModal
            enrollmentRequest={currentEnrollementRequest}
            onClose={(updateList) => {
              setRequestId(undefined);
              updateList && refetch();
            }}
          />
        )}
      </>
    )
  );
};

const EnrollmentRequestList = () => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="3xl">
            Enrollment requests
          </Title>
        </StackItem>
        <StackItem>
          <EnrollmentRequestTable />
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default EnrollmentRequestList;
