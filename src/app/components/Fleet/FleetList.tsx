import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  SelectList,
  SelectOption,
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
import { useTableSelect } from '@app/hooks/useTableSelect';
import TableActions from '../Table/TableActions';
import { getResourceId } from '@app/utils/resource';
import MassDeleteFleetModal from '../modals/massModals/MassDeleteFleetModal/MassDeleteFleetModal';

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

const canDeleteResource = (fleet: Fleet) =>
  fleet.metadata?.owner ? 'Fleets managed by a Resourcesync cannot be deleted' : undefined;

const FleetTable = () => {
  const [fleetList, loading, error, refetch] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });
  const { remove } = useFetch();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  const { search, setSearch, filteredData } = useTableTextSearch(fleetList?.items || [], getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, selectedResources, isAllSelected, isRowSelected, setAllSelected } = useTableSelect(sortedData);

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'fleet',
    onDelete: async (resourceId) => {
      await remove('fleets', resourceId);
      refetch();
    },
  });

  const { editLabelsAction, editLabelsModal } = useEditLabelsAction<Fleet>({
    submitTransformer: getUpdatedFleet,
    resourceType: 'fleets',
    onEditSuccess: refetch,
  });

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
          <ToolbarItem>
            <TableActions>
              <SelectList>
                <SelectOption isDisabled={!selectedResources.length} onClick={() => setIsMassDeleteModalOpen(true)}>
                  Delete
                </SelectOption>
              </SelectList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label="Fleets table"
        columns={columns}
        data={filteredData}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedData.map((fleet, rowIndex) => {
            const fleetName = fleet.metadata.name as string;
            return (
              <Tr key={fleetName}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: onRowSelect(fleet),
                    isSelected: isRowSelected(fleet),
                  }}
                />
                <Td dataLabel="Name">
                  <Link to={`${fleetName}`}>{fleetName}</Link>
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
                      editLabelsAction({
                        resourceId: fleetName,
                        disabledReason: !!fleet.metadata?.owner && 'Fleets managed by a Resourcesync cannot be edited',
                      }),
                      deleteAction({
                        resourceId: fleetName,
                        disabledReason: canDeleteResource(fleet),
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
      {isMassDeleteModalOpen && (
        <MassDeleteFleetModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter((r) => selectedResources.includes(getResourceId(r)))}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </ListPageBody>
  );
};

const FleetList = () => (
  <ListPage title="Fleets" actions={<CreateFleetButton />}>
    <FleetTable />
  </ListPage>
);

export default FleetList;
