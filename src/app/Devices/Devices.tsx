import * as React from 'react';
import { fetchData, tableCellData } from '@app/utils/commonFunctions';
import { deviceList } from '@app/utils/commonDataTypes';
import { useAuth } from 'react-oidc-context';
import {
  PageSection,
  Spinner,
  Title,
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [devicesData, setDevicesData] = React.useState<deviceList>({ items: [] });
  const defaultActions = (device: Device): IAction[] => [
    {
      title: "View",
      onClick: () => window.location.replace(`/device/${device.metadata.name}`)
    }
  ];


  function getEvents() {
    fetchData('devices', auth.user?.access_token ?? '').then((data) => {
      setDevicesData(data);
      setIsLoading(false);
    });
  }
  React.useEffect(() => {
    setIsLoading(true);
    getEvents();
    setInterval(() => {
      getEvents();
    }, 10000);
    return auth.events.addAccessTokenExpiring(() => {
      auth.signinSilent();
    })
}, [auth.events, auth.signinSilent]);

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
        {devicesData.items.length > 0 && (
          <Tbody>
            {devicesData.items.map((device) => (

              <Tr key={device.metadata.name}>
                {
                  columns.map((column) => (
                    <Td dataLabel={column.label} key={`${column.label}${device.metadata.name}`}>
                      {tableCellData(column, device)}
                    </Td>
                  ))}
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
