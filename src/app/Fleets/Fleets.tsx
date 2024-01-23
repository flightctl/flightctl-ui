import * as React from 'react';
import { tableCellData } from '@app/utils/commonFunctions';
import { Link } from 'react-router-dom';
import { CreateFleet } from './Create';
import {
  PageSection,
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Icon,
  SearchInput,
  Button,
  Spinner,
  Title,
} from '@patternfly/react-core';
import FaFilter from '@patternfly/react-icons/dist/js/icons/filter-icon';
import {
  ActionsColumn,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';

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
  const [fleetsData, isLoading, error] = useFetchPeriodically<itemsList>('fleets');

  const [isOpenFleet, setIsOpenFleet] = React.useState(false);

  const onFleetToggleClick = () => {
    setIsOpenFleet(!isOpenFleet);
  };
  const onFleetSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setIsOpenFleet(false);
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Fleets</Title>
      <Dropdown
                    isOpen={isOpenFleet}
                    onSelect={onFleetSelect}
                    onOpenChange={(isOpenFleet: boolean) => setIsOpenFleet(isOpenFleet)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle ref={toggleRef} isFullWidth onClick={onFleetToggleClick} isExpanded={isOpenFleet} style={{ width: '120px', backgroundColor: 'white' }}>
                        <div id="togglefleet"><Icon><FaFilter></FaFilter></Icon> Name</div>
                      </MenuToggle>
                    )}
                    ouiaId="fleetdropdown"
                    shouldFocusToggleOnSelect

                  >
                    <DropdownList id="dropdown-list-fleet">
                      <SearchInput
                        id="search-fleet"
                        value=""
                        placeholder="Search Fleet"
                      />
      </DropdownList>
      </Dropdown>
      <Link to="/devicemanagement/fleets/create"><Button variant="primary" style={{ marginLeft: '15px', marginBottom: '15px' }} ouiaId="new-fleet">
      Create fleet
    </Button></Link>
    <Link to="/devicemanagement/fleets/import"><Button variant="secondary" style={{ marginLeft: '15px', marginBottom: '15px' }} ouiaId="new-fleet">
      Import fleets
    </Button></Link>

      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.label}</Th>
            ))}
            <Td></Td>
          </Tr>
        </Thead>

        {!!fleetsData?.items?.length && (
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
