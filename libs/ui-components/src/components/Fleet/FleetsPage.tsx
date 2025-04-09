import * as React from 'react';
import {
  Button,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
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
import TablePagination from '../Table/TablePagination';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { ApiSortTableColumn } from '../Table/Table';
import { useTableSelect } from '../../hooks/useTableSelect';
import { getResourceId } from '../../utils/resource';
import MassDeleteFleetModal from '../modals/massModals/MassDeleteFleetModal/MassDeleteFleetModal';
import FleetRow from './FleetRow';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import DeleteFleetModal from './DeleteFleetModal/DeleteFleetModal';
import FleetResourceSyncs from './FleetResourceSyncs';
import { useFleetBackendFilters, useFleets } from './useFleets';
import { useAccessReview } from '../../hooks/useAccessReview';
import ButtonWithPermissions from '../common/ButtonWithPermissions';
import { RESOURCE, VERB } from '../../types/rbac';
import PageWithPermissions from '../common/PageWithPermissions';
import { useFleetImportAccessReview } from '../../hooks/useFleetImportAccessReview';

const FleetPageActions = ({ createText }: { createText?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canCreateFleet = useAccessReview(RESOURCE.FLEET, VERB.CREATE);
  const canImportFleet = useFleetImportAccessReview();

  return (
    <Split hasGutter>
      <SplitItem>
        <ButtonWithPermissions
          permissions={canCreateFleet}
          variant="primary"
          onClick={() => navigate(ROUTE.FLEET_CREATE)}
        >
          {createText || t('Create a fleet')}
        </ButtonWithPermissions>
      </SplitItem>
      <SplitItem>
        <ButtonWithPermissions
          permissions={canImportFleet}
          variant="secondary"
          onClick={() => navigate(ROUTE.FLEET_IMPORT)}
        >
          {t('Import fleets')}
        </ButtonWithPermissions>
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
    name: t('Up-to-date/devices'),
  },
  {
    name: t('Status'),
  },
];

const FleetTable = () => {
  const { t } = useTranslation();

  const fleetColumns = React.useMemo(() => getColumns(t), [t]);
  const { name, setName, hasFiltersEnabled } = useFleetBackendFilters();

  const { fleets, isLoading, error, isUpdating, refetch, pagination } = useFleets({ name, addDevicesSummary: true });

  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [fleetToDeleteId, setFleetToDeleteId] = React.useState<string>();

  const { onRowSelect, isAllSelected, hasSelectedRows, isRowSelected, setAllSelected } = useTableSelect();

  const [canDelete] = useAccessReview(RESOURCE.FLEET, VERB.DELETE);
  const [canCreate] = useAccessReview(RESOURCE.FLEET, VERB.CREATE);
  const [canEdit] = useAccessReview(RESOURCE.FLEET, VERB.PATCH);

  return (
    <ListPageBody error={error} loading={isLoading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={name} setValue={setName} placeholder={t('Search by name')} />
            </ToolbarItem>
          </ToolbarGroup>
          {canCreate && (
            <ToolbarItem>
              <FleetPageActions createText={t('Create fleet')} />
            </ToolbarItem>
          )}
          {canDelete && (
            <ToolbarItem>
              <Button isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)} variant="secondary">
                {t('Delete fleets')}
              </Button>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Fleets table')}
        loading={isUpdating}
        columns={fleetColumns}
        hasFilters={hasFiltersEnabled}
        emptyData={fleets.length === 0}
        clearFilters={() => setName('')}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {fleets.map((fleet, rowIndex) => (
            <FleetRow
              key={getResourceId(fleet)}
              fleet={fleet}
              rowIndex={rowIndex}
              canDelete={canDelete}
              onDeleteClick={() => {
                setFleetToDeleteId(fleet.metadata.name || '');
              }}
              isRowSelected={isRowSelected}
              onRowSelect={onRowSelect}
              canEdit={canEdit}
            />
          ))}
        </Tbody>
      </Table>
      <TablePagination pagination={pagination} isUpdating={isUpdating} />
      {!isUpdating && fleets.length === 0 && !name && <FleetEmptyState />}
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

const FleetsPageWithPermissions = () => {
  const [allowed, loading] = useAccessReview(RESOURCE.FLEET, VERB.LIST);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <FleetsPage />
    </PageWithPermissions>
  );
};

export default FleetsPageWithPermissions;
