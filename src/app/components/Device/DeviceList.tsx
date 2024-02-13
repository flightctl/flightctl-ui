import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { EmptyState, EmptyStateHeader } from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DeviceList } from '@types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';

const DeviceEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>There are no devices yet</>} headingLevel="h4" />
  </EmptyState>
);

const DeviceTable = () => {
  const [devicesList, loading, error, refetch] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });
  const { remove } = useFetch();

  return (
    <ListPageBody data={devicesList?.items} error={error} loading={loading} emptyState={<DeviceEmptyState />}>
      <Table aria-label="Devices table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th modifier="wrap">Creation timestamp</Th>
            <Th modifier="wrap">Operating system</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {devicesList?.items.map((device) => (
            <Tr key={device.metadata.name}>
              <Td dataLabel="Name">
                <Link to={`${device.metadata.name}`}>{device.metadata.name}</Link>
              </Td>
              <Td dataLabel="Creation timestamp">{device.metadata.creationTimestamp || '-'}</Td>
              <Td dataLabel="Machine ID">{device.status?.systemInfo?.operatingSystem || '-'}</Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: 'Delete',
                      onClick: async () => {
                        await remove(`devices/${device.metadata.name}`);
                        refetch();
                      },
                    },
                  ]}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </ListPageBody>
  );
};

const DeviceList = () => (
  <ListPage title="Devices">
    <DeviceTable />
  </ListPage>
);

export default DeviceList;
