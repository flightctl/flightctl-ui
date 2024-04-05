import * as React from 'react';
import {
  Button,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { useNavigate } from 'react-router-dom';
import { TopologyIcon } from '@patternfly/react-icons/dist/js/icons/topology-icon';

import { Fleet, FleetList, ResourceSync, ResourceSyncList } from '@types';
import { useFetch } from '@app/hooks/useFetch';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { sortByName, sortByOwner } from '@app/utils/sort/generic';
import { sortByStatus, sortFleetsByOSImg } from '@app/utils/sort/fleet';
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
import { isFleet } from '@app/types/extraTypes';
import FleetRow from './FleetRow';
import ResourceSyncRow from './ResourceSyncRow';
import ResourceListEmptyState from '@app/components/common/ResourceListEmptyState';

const FleetPageActions = ({ createText }: { createText?: string }) => {
  const navigate = useNavigate();
  return (
    <Split hasGutter>
      <SplitItem>
        <Button variant="primary" onClick={() => navigate('/devicemanagement/fleets/create')}>
          {createText || 'Create a fleet'}
        </Button>
      </SplitItem>
      <SplitItem>
        <Button variant="secondary" onClick={() => navigate('/devicemanagement/fleets/import')}>
          Import fleets
        </Button>
      </SplitItem>
    </Split>
  );
};

const FleetEmptyState = () => (
  <ResourceListEmptyState icon={TopologyIcon} titleText="No fleets here!">
    <EmptyStateBody>
      Fleets are an easy way to manage multiple devices that share the same configurations.
      <br />
      With fleets you&apos;ll be able to edit and update devices in mass.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <FleetPageActions />
      </EmptyStateActions>
    </EmptyStateFooter>
  </ResourceListEmptyState>
);

const columns: TableColumn<Fleet | ResourceSync>[] = [
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
    name: 'Status',
    onSort: sortByStatus,
  },
  {
    name: 'Managed by',
    onSort: sortByOwner,
  },
];

const getSearchText = (resource: Fleet | ResourceSync) => [resource.metadata.name];

const FleetTable = () => {
  const [fleetList, loading, error, refetch] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });
  const [rsList, rsLoading, rsError, rsRefetch] = useFetchPeriodically<ResourceSyncList>({ endpoint: 'resourcesyncs' });

  const { remove } = useFetch();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  const data = [
    ...(fleetList?.items || []),
    ...(rsList?.items || []).filter(
      (rs) => !(fleetList?.items || []).some((fleet) => fleet.metadata.owner === `ResourceSync/${rs.metadata.name}`),
    ),
  ];

  const { search, setSearch, filteredData } = useTableTextSearch(data, getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, selectedResources, isAllSelected, isRowSelected, setAllSelected } = useTableSelect(sortedData);

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'fleet',
    onDelete: async (resourceId) => {
      await remove('fleets', resourceId);
      refetch();
    },
  });

  const { deleteAction: deleteRsAction, deleteModal: deleteRsModal } = useDeleteListAction({
    resourceType: 'resource sync',
    onDelete: async (resourceId) => {
      await remove('resourcesyncs', resourceId);
      rsRefetch();
    },
  });

  const { editLabelsAction, editLabelsModal } = useEditLabelsAction<Fleet>({
    submitTransformer: getUpdatedFleet,
    resourceType: 'fleets',
    onEditSuccess: refetch,
  });

  return (
    <ListPageBody error={error || rsError} loading={loading || rsLoading}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
          <ToolbarItem>
            <FleetPageActions createText="Create fleet" />
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
        emptyFilters={filteredData.length === 0 && data.length > 0}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedData.map((resource, rowIndex) =>
            isFleet(resource) ? (
              <FleetRow
                key={getResourceId(resource)}
                fleet={resource}
                rowIndex={rowIndex}
                deleteAction={deleteAction}
                editLabelsAction={editLabelsAction}
                isRowSelected={isRowSelected}
                onRowSelect={onRowSelect}
              />
            ) : (
              <ResourceSyncRow
                key={getResourceId(resource)}
                resourceSync={resource}
                rowIndex={rowIndex}
                isRowSelected={isRowSelected}
                onRowSelect={onRowSelect}
                deleteAction={deleteRsAction}
                editLabelsAction={editLabelsAction}
              />
            ),
          )}
        </Tbody>
      </Table>
      {data.length === 0 && <FleetEmptyState />}
      {deleteModal}
      {editLabelsModal}
      {deleteRsModal}
      {isMassDeleteModalOpen && (
        <MassDeleteFleetModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter((r) => selectedResources.includes(getResourceId(r)))}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
            rsRefetch();
          }}
        />
      )}
    </ListPageBody>
  );
};

const FleetList = () => (
  <ListPage title="Fleets">
    <FleetTable />
  </ListPage>
);

export default FleetList;
