import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { FleetList } from '@types';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import LabelsView from '@app/components/common/LabelsView';

const FleetListToolbar = () => {
  const navigate = useNavigate();
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <Button variant="primary" onClick={() => navigate('/devicemanagement/fleets/create')}>
            Create
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

const FleetEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>You haven&apos;t created any fleets yet</>} headingLevel="h4" />
    <EmptyStateBody>Create a new fleet using the &quot;Create&quot; button</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <FleetListToolbar />
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

const FleetTable = () => {
  const [fleetList, loading, error, refetch] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });
  const { remove } = useFetch();

  return (
    <ListPageBody data={fleetList?.items} error={error} loading={loading} emptyState={<FleetEmptyState />}>
      <FleetListToolbar />
      <Table aria-label="Fleets table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>OS image</Th>
            <Th>Label selector</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {fleetList?.items.map((fleet) => (
            <Tr key={fleet.metadata.name}>
              <Td dataLabel="Name">
                <Link to={`${fleet.metadata.name}`}>{fleet.metadata.name}</Link>
              </Td>
              <Td dataLabel="OS image">{fleet.spec.template.spec.os?.image || '-'}</Td>
              <Td dataLabel="Label selector">
                <LabelsView labels={fleet.spec.selector?.matchLabels} />
              </Td>
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
    </ListPageBody>
  );
};

const FleetList = () => (
  <ListPage title="Fleets">
    <FleetTable />
  </ListPage>
);

export default FleetList;
