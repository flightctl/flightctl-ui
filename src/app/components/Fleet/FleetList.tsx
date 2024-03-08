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
import { useDeleteListAction } from '../ListPage/ListPageActions';

const CreateFleetButton = () => {
  const navigate = useNavigate();
  return (
    <Button variant="primary" onClick={() => navigate('/devicemanagement/fleets/create')}>
      Create
    </Button>
  );
};

const FleetEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>You haven&apos;t created any fleets yet</>} headingLevel="h4" />
    <EmptyStateBody>Create a new fleet using the &quot;Create&quot; button</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <CreateFleetButton />
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

const FleetTable = () => {
  const [fleetList, loading, error, refetch] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });
  const { remove } = useFetch();
  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Fleet',
    onDelete: async (resourceId: string) => {
      await remove(`fleets/${resourceId}`);
      refetch();
    },
  });

  return (
    <ListPageBody data={fleetList?.items} error={error} loading={loading} emptyState={<FleetEmptyState />}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <CreateFleetButton />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
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
                <ActionsColumn items={[deleteAction(fleet.metadata.name || '')]} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {deleteModal}
    </ListPageBody>
  );
};

const FleetList = () => (
  <ListPage title="Fleets">
    <FleetTable />
  </ListPage>
);

export default FleetList;
