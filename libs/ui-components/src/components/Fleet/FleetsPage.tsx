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

import { Fleet, FleetList } from '@flightctl/types';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
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
import FleetRow from './FleetRow';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import DeleteFleetModal from './DeleteFleetModal/DeleteFleetModal';
import FleetResourceSyncs from './FleetResourceSyncs';

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

const getColumns = (t: TFunction): TableColumn<Fleet>[] => [
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('System image'),
    onSort: sortFleetsByOSImg,
  },
  {
    name: t('Devices'),
  },
  {
    name: t('Status'),
    onSort: sortByStatus,
  },
];

const getSearchText = (fleet: Fleet) => [fleet.metadata.name];

const FleetTable = ({ fleetLoad }: { fleetLoad: FleetLoad }) => {
  const { t } = useTranslation();

  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [fleetToDeleteId, setFleetToDeleteId] = React.useState<string>();

  const [fleetList, loading, error, refetch] = fleetLoad;
  const columns = React.useMemo(() => getColumns(t), [t]);
  const fleets = fleetList?.items || [];
  const { search, setSearch, filteredData } = useTableTextSearch(fleets, getSearchText);
  const { getSortParams, sortedData: sortedFleets } = useTableSort(filteredData, columns);
  const { onRowSelect, isAllSelected, hasSelectedRows, isRowSelected, setAllSelected } = useTableSelect();

  return (
    <ListPageBody error={error} loading={loading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={search} setValue={setSearch} placeholder={t('Search by name')} />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <FleetPageActions createText={t('Create fleet')} />
          </ToolbarItem>
          <ToolbarItem>
            <TableActions isDisabled={!hasSelectedRows}>
              <SelectList>
                <SelectOption onClick={() => setIsMassDeleteModalOpen(true)}>{t('Delete')}</SelectOption>
              </SelectList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Fleets table')}
        loading={loading}
        columns={columns}
        emptyFilters={filteredData.length === 0}
        emptyData={fleets.length === 0}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedFleets.map((fleet, rowIndex) => (
            <FleetRow
              key={getResourceId(fleet)}
              fleet={fleet}
              rowIndex={rowIndex}
              onDeleteClick={() => {
                setFleetToDeleteId(fleet.metadata.name || '');
              }}
              isRowSelected={isRowSelected}
              onRowSelect={onRowSelect}
            />
          ))}
        </Tbody>
      </Table>
      {fleets.length === 0 && <FleetEmptyState />}
      {fleetToDeleteId && (
        <DeleteFleetModal
          fleetId={fleetToDeleteId}
          onClose={(hasDeleted?: boolean) => {
            if (hasDeleted) {
              refetch();
            }
            setFleetToDeleteId(undefined);
          }}
        />
      )}
      {isMassDeleteModalOpen && (
        <MassDeleteFleetModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          fleets={sortedFleets.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </ListPageBody>
  );
};

type FleetLoad = [FleetList | undefined, boolean, unknown, VoidFunction, boolean];

const FleetsPage = () => {
  const { t } = useTranslation();

  // TODO move the fetch down to FleetTable when the API includes the filter for pending / errored resource syncs
  const fleetLoad = useFetchPeriodically<FleetList>({ endpoint: 'fleets?addDevicesCount=true' });

  return (
    <>
      <FleetResourceSyncs fleets={fleetLoad[0]?.items || []} />

      <ListPage title={t('Fleets')}>
        <FleetTable fleetLoad={fleetLoad} />
      </ListPage>
    </>
  );
};

export default FleetsPage;
