import * as React from 'react';
import { fetchData, tableCellData } from '@app/utils/commonFunctions'; 
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
} from '@patternfly/react-table';

type fleet = {
  metadata: {
    name: string | null;
    creationTimestamp: string | null;
    deletionTimestamp: string | null;
    labels: {
      [key: string]: string;
    }
  };
  spec: {
    template: {
      config: {};
      os: {};
    };
  status: {};
  };
};
type itemsList = {
  items: fleet[];

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
  { key: 'os_image', label: 'OS Image' },
  { key: 'config_template', label: 'Config Template' },
  { key: 'devices_count', label: 'Device Count' },
  { key: 'devices_nominal_count', label: 'Device Nominal Count' },
];



const Fleets: React.FunctionComponent = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [fleetsData, setFleetsData] = React.useState<itemsList>({ items: [] });
  function getEvents() {
    fetchData('fleets', auth.user?.access_token ?? '').then((data) => {
      setFleetsData(data);
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

        {fleetsData.items.length > 0 && (
          <Tbody>
            {fleetsData.items.map((fleet) => (
              <Tr key={fleet.metadata.name}>
                {columns.map((column) => (
                  
                  <Td dataLabel={column.label} key={`${column.label}${fleet.metadata.name}`}>
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
