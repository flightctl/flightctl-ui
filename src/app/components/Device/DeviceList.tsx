import * as React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, EmptyStateHeader } from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Device, DeviceList } from '@types';

import DeviceFleet from '@app/components/Device/DeviceDetails/DeviceFleet';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { useDeleteListAction } from '../ListPage/ListPageActions';

interface DeviceTableProps {
  devices: Device[];
  showFleet: boolean;
  refetch: VoidFunction;
}

const DeviceEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>There are no devices yet</>} headingLevel="h4" />
  </EmptyState>
);

export const DeviceTable = ({ devices, showFleet, refetch }: DeviceTableProps) => {
  const { remove } = useFetch();
  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Device',
    onDelete: async (resourceId: string) => {
      await remove(`devices/${resourceId}`);
      refetch();
    },
  });

  return (
    <>
      <Table aria-label="Devices table">
        <Thead>
          <Tr>
            <Th modifier="wrap">Fingerprint</Th>
            <Th modifier="wrap">Name</Th>
            {showFleet && <Th>Fleet</Th>}
            <Th modifier="wrap">Creation timestamp</Th>
            <Th modifier="wrap">Operating system</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {devices.map((device) => {
            const deviceName = device.metadata.name as string;
            const displayName = device.metadata.labels?.displayName;
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
                <Td dataLabel="Creation timestamp">{device.metadata.creationTimestamp || '-'}</Td>
                <Td dataLabel="Operating system">{device.spec.os?.image || '-'}</Td>
                <Td isActionCell>
                  <ActionsColumn items={[deleteAction({ resourceId: deviceName, resourceName: displayName })]} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {deleteModal}
    </>
  );
};

const DeviceListTable = () => {
  const [devicesList, loading, error, refetch] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });

  return (
    <ListPageBody data={devicesList?.items} error={error} loading={loading} emptyState={<DeviceEmptyState />}>
      <DeviceTable devices={devicesList?.items || []} refetch={refetch} showFleet />
    </ListPageBody>
  );
};

const DeviceList = () => (
  <ListPage title="Devices">
    <DeviceListTable />
  </ListPage>
);

export default DeviceList;
