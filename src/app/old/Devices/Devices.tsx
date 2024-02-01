import * as React from 'react';
import { tableCellData, deleteObject } from '@app/old/utils/commonFunctions';
import { deviceList } from '@app/old/utils/commonDataTypes';
import { useAuth } from 'react-oidc-context';
import {
  PageSection,
  Spinner,
  Title,
  Label,
} from '@patternfly/react-core';

import {
  ActionsColumn,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IAction,
} from '@patternfly/react-table';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';

interface Device {
  metadata: {
    name: string
  }
}

const dateFormatter = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  let dateObj;
  const epoch = Number(date);
  if (epoch) {
    dateObj = new Date(epoch * 1000);
  } else {
    dateObj = new Date(date);
  }
  return `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
};

const columns = [
  { key: 'metadata.name', label: 'Name' },
  { key: 'metadata.labels', label: 'Labels' },
  { key: 'status.systemInfo.machineID', label: 'Machine ID' },
  { key: 'status.systemInfo.bootID', label: 'Boot ID' },
  { key: 'status.online', label: 'Status' }
];

const Devices: React.FunctionComponent = () => {
  const auth = useAuth();
  const [devicesData, isLoading, error, refetch] = useFetchPeriodically<deviceList>('devices');
  const defaultActions = (device: Device): IAction[] => [
    {
      title: "Details",
      onClick: () => window.location.replace(`/device/${device.metadata.name}`)
    },
    {
      title: "Delete",
      onClick: () => deleteObject("devices", device.metadata.name, auth.user?.access_token ?? '').then(refetch)
    }
  ];



  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Devices</Title>
      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.label}</Th>
            ))}
            <Td></Td>
          </Tr>
        </Thead>
        {!!devicesData?.items.length && (
          <Tbody>
            {devicesData.items.map((device) => (
              <Tr key={device.metadata.name}>
                {
                  columns.map((column) => (
                    // add a if column.key === "metadata.labels" then do a for loop to iterate through the labels and display them
                    column.key === "metadata.labels"
                    ? (
                      <Td dataLabel={column.label} key={`${column.label}${device.metadata.name}`}>
                        {tableCellData(column, device)}
                      </Td>
                    )
                    : (
                      <Td dataLabel={column.label} key={`${column.label}${device.metadata.name}`}>
                        {tableCellData(column, device)}
                      </Td>
                    )
                  ))
                  }
                <Td isActionCell>
                  <ActionsColumn
                    items={defaultActions(device as Device)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        )}
      </Table>
      {isLoading ? <Spinner /> : null}
    </PageSection>
  );
};

export { Devices };
