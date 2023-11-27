import * as React from 'react';

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

// import axios from 'axios';

type fleet = {
  name: string | null;
  labels: string | null;
  os_image: string | null;
  config_template: string | null;
  devices_count: string | null;
  devices_nominal_count: string | null;
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
  { key: 'name', label: 'Name' },
  { key: 'labels', label: 'Labels' },
  { key: 'os_image', label: 'OS Image' },
  { key: 'config_template', label: 'Config Template' },
  { key: 'devices_count', label: 'Device Count' },
  { key: 'devices_nominal_count', label: 'Device Nominal Count' },
];

const tableCellData = (column, fleet) => {
  const data = column.formatter ? column.formatter(fleet[column.key]) : fleet[column.key];
  if (column.key === 'host') {
    return <a href="#">{data}</a>;
  }
  return data;
};

const Fleets: React.FunctionComponent = () => {
  const [fleetData, setFleetData] = React.useState<fleet[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  function getEvents() {
    // axios
    //   //.get('http://192.168.0.116/data.json')
    //   .get('/data.json')
    //   .then((response) => response.data)
    //   .then((data) => {
    //     setFleetData(data);
    //     setIsLoading(false);
    //   });
  }
  React.useEffect(() => {
    setIsLoading(true);
    getEvents();
    setInterval(getEvents, 10000);
  }, []);

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Fleets</Title>
      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.label}</Th>
            ))}
            <Td></Td>
          </Tr>
        </Thead>

        {fleetData.length > 0 && (
          <Tbody>
            {fleetData.map((fleet) => (
              <Tr key={fleet.name}>
                {columns.map((column) => (
                  <Td dataLabel={column.label} key={`${column.label}${fleet.name}`}>
                    {tableCellData(column, fleet)}
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

export { Fleets };
