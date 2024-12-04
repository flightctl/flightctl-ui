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

import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { ApiSortTableColumn } from '../Table/Table';
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
import { useFleetBackendFilters, useFleets } from './useFleets';
import TablePagination from '../Table/TablePagination';

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

const getColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Name'),
  },
  {
    name: t('System image'),
  },
  {
    name: t('Devices'),
  },
  {
    name: t('Status'),
  },
];

const FleetTable = () => {
  const { t } = useTranslation();

  const fleetColumns = React.useMemo(() => getColumns(t), [t]);
  const { name, setName, hasFiltersEnabled } = useFleetBackendFilters();

  const fleetLoad = useFleets({ name, addDevicesCount: true });

  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [fleetToDeleteId, setFleetToDeleteId] = React.useState<string>();
  const { fleets, isLoading, error, isUpdating, refetch } = fleetLoad;

  const { onRowSelect, isAllSelected, hasSelectedRows, isRowSelected, setAllSelected } = useTableSelect();

  return (
    <ListPageBody error={error} loading={isLoading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={name} setValue={setName} placeholder={t('Search by name')} />
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
        loading={isUpdating}
        columns={fleetColumns}
        emptyFilters={!hasFiltersEnabled}
        emptyData={fleets.length === 0}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {fleets.map((fleet, rowIndex) => (
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
      <TablePagination
        isUpdating={fleetLoad.isUpdating}
        itemCount={fleetLoad.itemCount}
        currentPage={fleetLoad.currentPage}
        setCurrentPage={fleetLoad.setCurrentPage}
      />
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
          fleets={fleets.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </ListPageBody>
  );
};

const FleetsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <FleetResourceSyncs />

      <ListPage title={t('Fleets')}>
        <FleetTable />
      </ListPage>
    </>
  );
};

export default FleetsPage;
