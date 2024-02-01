import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import {
  Alert,
  Bullseye,
  Button,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { FleetList } from '@types';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

const FleetTable = () => {
  const [fleetList, loading, error, refetch] = useFetchPeriodically<FleetList>('fleets');
  const { remove } = useFetch();

  if (error) {
    return <Alert variant="danger" title="An error occured" isInline />;
  }

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    !!fleetList && (
      <Table aria-label="Fleets table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Source</Th>
            <Th>Devices</Th>
            <Th>In-sync</Th>
            <Th>Status</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {fleetList.items.map((fleet) => (
            <Tr key={fleet.metadata.name}>
              <Td dataLabel="Name">{fleet.metadata.name}</Td>
              <Td dataLabel="Source">{fleet.spec.template.spec.os?.image || '-'}</Td>
              <Td dataLabel="Devices">-</Td>
              <Td dataLabel="In-sync">-</Td>
              <Td dataLabel="Status">-</Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: 'Delete',
                      onClick: async () => {
                        await remove(`fleets/${fleet.metadata.name}`);
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
    )
  );
};

const FleetList = () => {
  const history = useHistory();

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1" size="3xl">
            Fleets
          </Title>
        </StackItem>
        <StackItem>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <Button variant="primary" onClick={() => history.push('/devicemanagement/fleets/create')}>
                  Create
                </Button>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </StackItem>
        <StackItem>
          <FleetTable />
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default FleetList;
