import * as React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, EmptyStateHeader, Icon } from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getDeviceFleet } from '@app/utils/devices';
import { Device, DeviceList } from '@types';

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
            const fleetName = getDeviceFleet(device);
            return (
              <Tr key={deviceName}>
                <Td dataLabel="Fingerprint">
                  <Link to={`/devicemanagement/devices/${deviceName}`}>{deviceName}</Link>
                </Td>
                <Td dataLabel="Name">{device.metadata.labels?.displayName || '-'}</Td>
                {showFleet && (
                  <Td dataLabel="Fleet">
                    {fleetName ? (
                      <Link to={`/devicemanagement/fleets/${fleetName}`}>{fleetName}</Link>
                    ) : (
                      <>
                        {' '}
                        <Icon status="info">
                          <InfoCircleIcon />
                        </Icon>{' '}
                        No matching Fleet
                      </>
                    )}
                  </Td>
                )}
                <Td dataLabel="Creation timestamp">{device.metadata.creationTimestamp || '-'}</Td>
                <Td dataLabel="Operating system">{device.status?.systemInfo?.operatingSystem || '-'}</Td>
                <Td isActionCell>
                  <ActionsColumn items={[deleteAction(device.metadata.name || '', deviceName)]} />
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
