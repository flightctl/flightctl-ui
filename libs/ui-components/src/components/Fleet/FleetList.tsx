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
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { TopologyIcon } from '@patternfly/react-icons/dist/js/icons/topology-icon';
import { Trans } from 'react-i18next';
import { TFunction } from 'i18next';

import { Fleet, FleetList, ResourceSync, ResourceSyncList } from '@flightctl/types';
import { useFetch } from '../../hooks/useFetch';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { sortByName } from '../../utils/sort/generic';
import { sortByStatus, sortFleetsByOSImg } from '../../utils/sort/fleet';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';
import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import { useTableSort } from '../../hooks/useTableSort';
import { useTableSelect } from '../../hooks/useTableSelect';
import TableActions from '../Table/TableActions';
import { getResourceId } from '../../utils/resource';
import MassDeleteFleetModal from '../modals/massModals/MassDeleteFleetModal/MassDeleteFleetModal';
import { isFleet } from '../../types/extraTypes';
import FleetRow from './FleetRow';
import ResourceSyncRow from './ResourceSyncRow';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import DeleteFleetModal from './DeleteFleetModal/DeleteFleetModal';

const FleetPageActions = ({ createText }: { createText?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Split hasGutter>
      <SplitItem>
        <Button variant="primary" onClick={() => navigate(ROUTE.FLEET_CREATE)}>
          {createText || t('Create a fleet')}
        </Button>
      </SplitItem>
      <SplitItem>
        <Button variant="secondary" onClick={() => navigate(ROUTE.FLEET_IMPORT)}>
          {t('Import fleets')}
        </Button>
      </SplitItem>
    </Split>
  );
};

const FleetEmptyState = () => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={TopologyIcon} titleText={t('No fleets here!')}>
      <EmptyStateBody>
        <Trans t={t}>
          Fleets are an easy way to manage multiple devices that share the same configurations.
          <br />
          With fleets you will be able to edit and update devices in mass.
        </Trans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <FleetPageActions />
        </EmptyStateActions>
      </EmptyStateFooter>
    </ResourceListEmptyState>
  );
};

const getColumns = (t: TFunction): TableColumn<Fleet | ResourceSync>[] => [
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('System image'),
    onSort: sortFleetsByOSImg,
  },
  {
    name: t('Device selector'),
  },
  {
    name: t('Status'),
    onSort: sortByStatus,
  },
];

const getSearchText = (resource: Fleet | ResourceSync) => [resource.metadata.name];

const FleetTable = () => {
  const { t } = useTranslation();
  const [fleetList, loading, error, refetch] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });
  const [rsList, rsLoading, rsError, rsRefetch] = useFetchPeriodically<ResourceSyncList>({ endpoint: 'resourcesyncs' });
  const { remove } = useFetch();

  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [fleetToDeleteId, setFleetToDeleteId] = React.useState<string>();

  const data = React.useMemo(
    () => [
      ...(fleetList?.items || []),
      ...(rsList?.items || []).filter(
        (rs) => !(fleetList?.items || []).some((fleet) => fleet.metadata.owner === `ResourceSync/${rs.metadata.name}`),
      ),
    ],
    [fleetList, rsList],
  );

  const { search, setSearch, filteredData } = useTableTextSearch(data, getSearchText);

  const columns = React.useMemo(() => getColumns(t), [t]);

  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, isAllSelected, hasSelectedRows, isRowSelected, setAllSelected } = useTableSelect();

  const { deleteAction: deleteRsAction, deleteModal: deleteRsModal } = useDeleteListAction({
    resourceType: 'resource sync',
    onDelete: async (resourceId) => {
      await remove(`resourcesyncs/${resourceId}`);
      rsRefetch();
    },
  });

  return (
    <ListPageBody error={error || rsError} loading={loading || rsLoading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={search} setValue={setSearch} />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <FleetPageActions createText={t('Create fleet')} />
          </ToolbarItem>
          <ToolbarItem>
            <TableActions>
              <SelectList>
                <SelectOption isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)}>
                  {t('Delete')}
                </SelectOption>
              </SelectList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Fleets table')}
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
                onDeleteClick={() => {
                  setFleetToDeleteId(resource.metadata.name || '');
                }}
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
              />
            ),
          )}
        </Tbody>
      </Table>
      {data.length === 0 && <FleetEmptyState />}
      {fleetToDeleteId && (
        <DeleteFleetModal
          fleetId={fleetToDeleteId}
          onClose={(hasDeleted?: boolean) => {
            if (hasDeleted) {
              // Both lists are linked, so they both need to be refreshed
              rsRefetch();
              refetch();
            }
            setFleetToDeleteId(undefined);
          }}
        />
      )}
      {deleteRsModal}
      {isMassDeleteModalOpen && (
        <MassDeleteFleetModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter(isRowSelected)}
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

const FleetList = () => {
  const { t } = useTranslation();
  return (
    <ListPage title={t('Fleets')}>
      <FleetTable />
    </ListPage>
  );
};

export default FleetList;
