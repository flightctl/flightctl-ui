import * as React from 'react';
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
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import { Link, useNavigate } from 'react-router-dom';

import { Fleet, FleetList } from '@types';
import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import LabelsView from '@app/components/common/LabelsView';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import FleetOwnerLink from './FleetDetails/FleetOwnerLink';
import { useTableSort } from '@app/hooks/useTableSort';
import { sortByName, sortByOwner } from '@app/utils/sort/generic';
import { sortFleetsByOSImg } from '@app/utils/sort/fleet';
import { useTableTextSearch } from '@app/hooks/useTableTextSearch';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';

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

const columns: TableColumn<Fleet>[] = [
  {
    name: 'Name',
    onSort: sortByName,
  },
  {
    name: 'OS image',
    onSort: sortFleetsByOSImg,
  },
  {
    name: 'Label selector',
  },
  {
    name: 'Managed by',
    onSort: sortByOwner,
  },
];
const getSearchText = (fleet: Fleet) => [fleet.metadata.name];

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

  const { search, setSearch, filteredData } = useTableTextSearch(fleetList?.items || [], getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  return (
    <ListPageBody data={fleetList?.items} error={error} loading={loading} emptyState={<FleetEmptyState />}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Fleets table" columns={columns} data={filteredData} getSortParams={getSortParams}>
        <Tbody>
          {sortedData.map((fleet) => (
            <Tr key={fleet.metadata.name}>
              <Td dataLabel="Name">
                <Link to={`${fleet.metadata.name}`}>{fleet.metadata.name}</Link>
              </Td>
              <Td dataLabel="OS image">{fleet.spec.template.spec.os?.image || '-'}</Td>
              <Td dataLabel="Label selector">
                <LabelsView labels={fleet.spec.selector?.matchLabels} />
              </Td>
              <Td dataLabel="Managed by">
                <FleetOwnerLink owner={fleet.metadata?.owner} />
              </Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    deleteAction({
                      resourceId: fleet.metadata.name || '',
                      disabledReason: !!fleet.metadata?.owner && 'Fleets managed by a Resourcesync cannot be deleted',
                    }),
                  ]}
                />
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
  <ListPage title="Fleets" actions={<CreateFleetButton />}>
    <FleetTable />
  </ListPage>
);

export default FleetList;
