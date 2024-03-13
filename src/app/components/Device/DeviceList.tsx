import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Device, DeviceList, EnrollmentRequestList } from '@types';

import DeviceFleet from '@app/components/Device/DeviceDetails/DeviceFleet';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { DeleteListActionResult, useDeleteListAction } from '../ListPage/ListPageActions';
import { getDeviceFleet } from '@app/utils/devices';
import AddDeviceModal from './AddDeviceModal/AddDeviceModal';
import EnrollmentRequestTable from '../EnrollmentRequest/EnrollmentRequestTable';
import { getDateDisplay } from '@app/utils/dates';
import { TableColumn } from '@app/types/extraTypes';
import { useTableSort } from '@app/hooks/useTableSort';
import { sortByCreationTimestamp, sortByDisplayName, sortByName } from '@app/utils/sort/generic';
import { sortDevicesByFleet, sortDevicesByOS } from '@app/utils/sort/device';

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

const DeviceRow = ({
  device,
  showFleet,
  deleteAction,
}: {
  device: Device;
  showFleet: boolean;
  deleteAction: DeleteListActionResult['deleteAction'];
}) => {
  const deviceName = device.metadata.name as string;
  const displayName = device.metadata.labels?.displayName;
  const boundFleet = getDeviceFleet(device.metadata);
  return (
    <Tr key={deviceName}>
      <Td dataLabel="Fingerprint">
        <Link to={`/devicemanagement/devices/${deviceName}`}>{deviceName}</Link>
      </Td>
      <Td dataLabel="Name">{displayName || '-'}</Td>
      {showFleet && (
        <Td dataLabel="Fleet">
          <DeviceFleet deviceMetadata={device.metadata} />
        </Td>
      )}
      <Td dataLabel="Created at">{getDateDisplay(device.metadata.creationTimestamp)}</Td>
      <Td dataLabel="Operating system">{device.status?.systemInfo?.operatingSystem || '-'}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            deleteAction({
              resourceId: deviceName,
              resourceName: displayName,
              disabledReason: boundFleet ? 'Devices bound to a fleet cannot be deleted' : '',
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

const getColumns = (showFleet: boolean): TableColumn<Device>[] => [
  {
    name: 'Fingerprint',
    onSort: sortByName,
  },
  {
    name: 'Name',
    onSort: sortByDisplayName,
  },
  ...(showFleet
    ? [
        {
          name: 'Fleet',
          onSort: sortDevicesByFleet,
        },
      ]
    : []),
  {
    name: 'Created at',
    onSort: sortByCreationTimestamp,
  },
  {
    name: 'Operating system',
    onSort: sortDevicesByOS,
  },
];

interface DeviceTableProps {
  devices: Device[];
  showFleet: boolean;
  refetch: VoidFunction;
}

export const DeviceTable = ({ devices, showFleet, refetch }: DeviceTableProps) => {
  const { remove } = useFetch();
  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Device',
    onDelete: async (resourceId: string) => {
      await remove(`devices/${resourceId}`);
      refetch();
    },
  });

  const columns = React.useMemo(() => getColumns(showFleet), [showFleet]);
  const { getSortParams, sortedData } = useTableSort(devices, columns);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h3">Devices</Title>
      </PageSection>
      <Table aria-label="Devices table">
        <Thead>
          <Tr>
            {columns.map((c, index) => (
              <Th key={c.name} modifier="wrap" sort={getSortParams(index)}>
                {c.name}
              </Th>
            ))}
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((device) => (
            <DeviceRow device={device} showFleet={showFleet} key={device.metadata.name} deleteAction={deleteAction} />
          ))}
        </Tbody>
      </Table>
      {deleteModal}
    </>
  );
};

const DeviceList = () => {
  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [devicesList, loading, error, refetch] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });

  const [erList, erLoading, erEror, erRefetch] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: 'enrollmentrequests',
  });

  const data = [...(devicesList?.items || []), ...(erList?.items || [])];

  return (
    <>
      <ListPage title="Devices" actions={<Button onClick={() => setAddDeviceModal(true)}>Add device</Button>}>
        <ListPageBody
          data={data}
          error={error || erEror}
          loading={loading || erLoading}
          emptyState={<DeviceEmptyState onAddDevice={() => setAddDeviceModal(true)} />}
        >
          <Stack hasGutter>
            {erList?.items && (
              <StackItem>
                <EnrollmentRequestTable enrollmentRequests={erList.items} refetch={erRefetch} />
              </StackItem>
            )}
            {devicesList?.items && (
              <StackItem>
                <DeviceTable devices={devicesList.items} refetch={refetch} showFleet />
              </StackItem>
            )}
          </Stack>
        </ListPageBody>
      </ListPage>
      {addDeviceModal && <AddDeviceModal onClose={() => setAddDeviceModal(false)} />}
    </>
  );
};

export default DeviceList;
