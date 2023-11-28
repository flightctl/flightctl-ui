import * as React from 'react';
import { fetchData, tableCellData } from '@app/utils/commonFunctions'; 

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  Spinner,
  Text,
  TextContent,
  TextVariants,
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
} from '@patternfly/react-table';

type device = {
  metadata: {
    name: string | null;
    creationTimestamp: string | null;
    deletionTimestamp: string | null;
    labels: {
      [key: string]: string;
    }
  };
  status: {
    conditions: {};
    systemInfo: {
      architecture: string | null;
      bootID: string | null;
      machineID: string | null;
      operatingSystem: string | null;
    };
  };
};
type itemsList = {
  items: device[];

};
const dateFormatter = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  let dateObj;
  const epoch = Number(date);
  if (epoch) {
    dateObj = new Date(epoch * 1000);
  } else {
    dateObj = new Date(date);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
};

// SET THE COLUMNS HERE!!!
const columns = [
  { key: 'metadata.name', label: 'Name' },
  { key: 'metadata.labels', label: 'Labels' },
  { key: 'status.systemInfo.machineID', label: 'Machine ID' },
  { key: 'status.systemInfo.bootID', label: 'Boot ID' },
  { key: 'status.online', label: 'Status' }
];

const Devices: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [devicesData, setDevicesData] = React.useState<itemsList>({ items: [] });
  function getEvents() {
    fetchData('devices').then((data) => {

      setDevicesData(data);
      setIsLoading(false);
    });
  }
  React.useEffect(() => {
    setIsLoading(true);
    getEvents();
    setInterval(getEvents, 10000);
  }, []);

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
                {columns.map((column) => (   
                  <Td dataLabel={column.label} key={`${column.label}${device.metadata.name}`}>
                    {tableCellData(column, device)}
                  </Td>
                ))}
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                    ]}
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
