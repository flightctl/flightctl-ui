import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  SelectList,
  SelectOption,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';

import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Device, DeviceList, EnrollmentRequest, EnrollmentRequestList } from '@types';

import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import AddDeviceModal from './AddDeviceModal/AddDeviceModal';
import { useTableSort } from '@app/hooks/useTableSort';
import { sortByCreationTimestamp, sortByDisplayName, sortByName } from '@app/utils/sort/generic';
import { sortDevicesByFleet, sortDevicesByOS, sortDevicesByStatus } from '@app/utils/sort/device';
import Table, { TableColumn } from '../Table/Table';
import EnrollmentRequestTableRow from '../EnrollmentRequest/EnrollmentRequestTableRow';
import DeviceTableToolbar from './DeviceTableToolbar';
import { useDeviceFilters } from './useDeviceFilters';
import DeviceTableRow from './DeviceTableRow';
import { useEditLabelsAction } from '@app/hooks/useEditLabelsAction';
import { getUpdatedDevice } from '@app/utils/devices';
import { useTableSelect } from '@app/hooks/useTableSelect';
import TableActions from '../Table/TableActions';
import { getResourceId } from '@app/utils/resource';
import { isEnrollmentRequest } from '@app/types/extraTypes';
import MassDeleteDeviceModal from '../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import MassApproveDeviceModal from '../modals/massModals/MassApproveDeviceModal/MassApproveDeviceModal';
import DeviceEnrollmentModal from '../EnrollmentRequest/DeviceEnrollmentModal/DeviceEnrollmentModal';

type DeviceEmptyStateProps = {
  onAddDevice: VoidFunction;
};

const DeviceEmptyState: React.FC<DeviceEmptyStateProps> = ({ onAddDevice }) => (
  <EmptyState>
    <EmptyStateHeader titleText={<>There are no devices yet</>} headingLevel="h4" />
    <EmptyStateBody>Add a new device using the &quot;Add&quot; button</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button onClick={onAddDevice}>Add device</Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

const deviceColumns: TableColumn<Device | EnrollmentRequest>[] = [
  {
    name: 'Fingerprint',
    onSort: sortByName,
  },
  {
    name: 'Name',
    onSort: sortByDisplayName,
  },
  {
    name: 'Status',
    onSort: sortDevicesByStatus,
    defaultSort: true,
  },
  {
    name: 'Fleet',
    onSort: sortDevicesByFleet,
  },
  {
    name: 'Created at',
    onSort: sortByCreationTimestamp,
  },
  {
    name: 'Operating system',
    onSort: sortDevicesByOS,
    thProps: {
      modifier: 'wrap',
    },
  },
];

interface DeviceTableProps {
  queryFilters: { filterByFleetId: string | null };
  resources: Array<Device | EnrollmentRequest>;
  refetch: VoidFunction;
}

export const DeviceTable = ({ resources, queryFilters, refetch }: DeviceTableProps) => {
  const [requestId, setRequestId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [isMassApproveModalOpen, setIsMassApproveModalOpen] = React.useState(false);
  const { remove } = useFetch();

  const { filteredData, ...rest } = useDeviceFilters(resources, queryFilters);
  const { getSortParams, sortedData } = useTableSort(filteredData, deviceColumns);

  const { onRowSelect, selectedResources, isAllSelected, isRowSelected, setAllSelected } = useTableSelect(sortedData);

  const { deleteAction: deleteDeviceAction, deleteModal: deleteDeviceModal } = useDeleteListAction({
    resourceType: 'Device',
    onDelete: async (resourceId: string) => {
      await remove('devices', resourceId);
      refetch();
    },
  });

  const { deleteAction: deleteErAction, deleteModal: deleteErModal } = useDeleteListAction({
    resourceType: 'Enrollment request',
    onDelete: async (resourceId: string) => {
      await remove('enrollmentrequests', resourceId);
      refetch();
    },
  });

  const { editLabelsAction, editLabelsModal } = useEditLabelsAction<Device>({
    submitTransformer: getUpdatedDevice,
    resourceType: 'devices',
    onEditSuccess: refetch,
  });

  const currentEnrollmentRequest = resources.find(
    (res) => res.metadata.name === requestId && isEnrollmentRequest(res),
  ) as EnrollmentRequest | undefined;

  return (
    <>
      <DeviceTableToolbar {...rest}>
        <ToolbarItem>
          <TableActions>
            <SelectList>
              <SelectOption isDisabled={!selectedResources.length} onClick={() => setIsMassApproveModalOpen(true)}>
                Approve
              </SelectOption>
              <SelectOption isDisabled={!selectedResources.length} onClick={() => setIsMassDeleteModalOpen(true)}>
                Delete
              </SelectOption>
            </SelectList>
          </TableActions>
        </ToolbarItem>
      </DeviceTableToolbar>
      <Table
        aria-label="Devices table"
        columns={deviceColumns}
        data={filteredData}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedData.map((resource, index) =>
            isEnrollmentRequest(resource) ? (
              <EnrollmentRequestTableRow
                er={resource}
                key={resource.metadata.name}
                deleteAction={deleteErAction}
                onRowSelect={onRowSelect}
                isRowSelected={isRowSelected}
                rowIndex={index}
                onApprove={setRequestId}
              />
            ) : (
              <DeviceTableRow
                device={resource}
                key={resource.metadata.name}
                editLabelsAction={editLabelsAction}
                deleteAction={deleteDeviceAction}
                onRowSelect={onRowSelect}
                isRowSelected={isRowSelected}
                rowIndex={index}
              />
            ),
          )}
        </Tbody>
      </Table>
      {editLabelsModal}
      {deleteDeviceModal}
      {deleteErModal}
      {currentEnrollmentRequest && (
        <DeviceEnrollmentModal
          enrollmentRequest={currentEnrollmentRequest}
          onClose={(updateList) => {
            setRequestId(undefined);
            updateList && refetch();
          }}
        />
      )}
      {isMassDeleteModalOpen && (
        <MassDeleteDeviceModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter((r) => selectedResources.includes(getResourceId(r)))}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
      {isMassApproveModalOpen && (
        <MassApproveDeviceModal
          onClose={() => setIsMassApproveModalOpen(false)}
          resources={sortedData.filter((r) => selectedResources.includes(getResourceId(r)))}
          onApproveSuccess={() => {
            setIsMassApproveModalOpen(false);
            refetch();
          }}
        />
      )}
    </>
  );
};

const DeviceList = () => {
  const [searchParams] = useSearchParams();
  const filterByFleetId = searchParams.get('fleetId');

  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [devicesList, devicesLoading, devicesError, devicesRefetch] = useFetchPeriodically<DeviceList>({
    endpoint: `devices${filterByFleetId ? `?owner=Fleet/${filterByFleetId}` : ''}`,
  });

  const [erList, erLoading, erEror, erRefetch] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: filterByFleetId ? '' : 'enrollmentrequests',
  });

  const data = React.useMemo(() => {
    const devices = devicesList?.items || [];
    if (filterByFleetId) {
      return devices;
    }

    const deviceIds = devices.reduce((acc, curr) => {
      acc[curr.metadata.name || ''] = {};
      return acc;
    }, {});

    const ers = erList?.items || [];
    return [...devices, ...ers.filter((er) => !deviceIds[er.metadata.name || ''])];
  }, [devicesList?.items, erList?.items, filterByFleetId]);

  const refetch = () => {
    devicesRefetch();
    erRefetch();
  };

  return (
    <>
      <ListPage title="Devices" actions={<Button onClick={() => setAddDeviceModal(true)}>Add device</Button>}>
        <ListPageBody
          isEmpty={(!data?.length || data.length === 0) && !filterByFleetId}
          error={devicesError || erEror}
          loading={devicesLoading || (erLoading && !filterByFleetId)}
          emptyState={<DeviceEmptyState onAddDevice={() => setAddDeviceModal(true)} />}
        >
          <DeviceTable resources={data} refetch={refetch} queryFilters={{ filterByFleetId }} />
        </ListPageBody>
      </ListPage>
      {addDeviceModal && <AddDeviceModal onClose={() => setAddDeviceModal(false)} />}
    </>
  );
};

export default DeviceList;
