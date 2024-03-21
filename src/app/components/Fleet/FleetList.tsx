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
import { sortByName, sortByOwner } from '@app/utils/sort/generic';
import { sortFleetsByOSImg } from '@app/utils/sort/fleet';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';
import { useEditLabelsAction } from '@app/hooks/useEditLabelsAction';
import { getUpdatedFleet } from '@app/utils/fleets';
import { useTableTextSearch } from '@app/hooks/useTableTextSearch';
import { useTableSort } from '@app/hooks/useTableSort';

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

  const { editLabelsAction, editLabelsModal } = useEditLabelsAction<Fleet>({
    submitTransformer: getUpdatedFleet,
    resourceType: 'fleets',
    onEditSuccess: refetch,
  });

  const { search, setSearch, filteredData } = useTableTextSearch(fleetList?.items || [], getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  return (
    <ListPageBody
      isEmpty={!fleetList?.items || fleetList.items.length === 0}
      error={error}
      loading={loading}
      emptyState={<FleetEmptyState />}
    >
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Fleets table" columns={columns} data={filteredData} getSortParams={getSortParams}>
        <Tbody>
          {sortedData.map((fleet) => {
            const fleetName = fleet.metadata.name as string;
            return (
              <Tr key={fleetName}>
                <Td dataLabel="Name">
                  <Link to={fleetName}>{fleetName}</Link>
                </Td>
                <Td dataLabel="OS image">{fleet.spec.template.spec.os?.image || '-'}</Td>
                <Td dataLabel="Label selector">
                  <LabelsView prefix={fleetName} labels={fleet.spec.selector?.matchLabels} />
                </Td>
                <Td dataLabel="Managed by">
                  <FleetOwnerLink owner={fleet.metadata?.owner} />
                </Td>
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      deleteAction({
                        resourceId: fleetName,
                        disabledReason: !!fleet.metadata?.owner && 'Fleets managed by a Resourcesync cannot be deleted',
                      }),
                      editLabelsAction({
                        resourceId: fleetName,
                        disabledReason: !!fleet.metadata?.owner && 'Fleets managed by a Resourcesync cannot be edited',
                      }),
                    ]}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {deleteModal}
      {editLabelsModal}
    </ListPageBody>
  );
};

const FleetList = () => (
  <ListPage title="Fleets" actions={<CreateFleetButton />}>
    <FleetTable />
  </ListPage>
);

export default FleetList;
