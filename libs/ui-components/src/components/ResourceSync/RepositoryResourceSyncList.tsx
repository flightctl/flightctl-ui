import * as React from 'react';
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import {
  EmptyState,
  EmptyStateBody,
  SelectList,
  SelectOption,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { useFetch } from '../../hooks/useFetch';
import { ResourceSync, ResourceSyncList } from '@flightctl/types';
import { getObservedHash } from '../../utils/status/repository';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { useTableSort } from '../../hooks/useTableSort';
import { sortByName } from '../../utils/sort/generic';
import {
  sortResourceSyncsByHash,
  sortResourceSyncsByPath,
  sortResourceSyncsByRevision,
  sortResourceSyncsByStatus,
} from '../../utils/sort/resourceSync';
import Table, { TableColumn } from '../Table/Table';
import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import TableTextSearch from '../Table/TableTextSearch';
import { useTableSelect } from '../../hooks/useTableSelect';
import TableActions from '../Table/TableActions';
import { getResourceId } from '../../utils/resource';

import './RepositoryResourceSyncList.css';
import MassDeleteResourceSyncModal from '../modals/massModals/MassDeleteResourceSyncModal/MassDeleteResourceSyncModal';
import ResourceSyncStatus from './ResourceSyncStatus';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';

const getColumns = (t: TFunction): TableColumn<ResourceSync>[] => [
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('Path'),
    onSort: sortResourceSyncsByPath,
  },
  {
    name: t('Target revision'),
    onSort: sortResourceSyncsByRevision,
  },
  {
    name: t('Status'),
    onSort: sortResourceSyncsByStatus,
  },
  {
    name: t('Observed hash'),
    onSort: sortResourceSyncsByHash,
  },
];

const createRefs = (rsList: ResourceSync[]): { [key: string]: React.RefObject<HTMLTableRowElement> } => {
  const rsRefs = {};
  rsList.forEach((rs) => {
    if (rs.metadata.name) {
      rsRefs[rs.metadata.name] = React.createRef();
    }
  });
  return rsRefs;
};

const getSearchText = (resourceSync: ResourceSync) => [resourceSync.metadata.name];

const ResourceSyncTable = ({ resourceSyncs, refetch }: { resourceSyncs: ResourceSync[]; refetch: VoidFunction }) => {
  const { t } = useTranslation();
  const { remove } = useFetch();
  const {
    router: { useLocation },
  } = useAppContext();
  const { hash = '#' } = useLocation();
  const rsRefs = createRefs(resourceSyncs);
  const selectedRs = hash.split('#')[1];

  React.useEffect(() => {
    const rsRow = rsRefs[selectedRs]?.current;
    if (rsRow) {
      rsRow.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    // Needs to be run only at the beginning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { filteredData, search, setSearch } = useTableTextSearch(resourceSyncs, getSearchText);

  const columns = React.useMemo(() => getColumns(t), [t]);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, selectedResources, isAllSelected, isRowSelected, setAllSelected } = useTableSelect(sortedData);

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Resource Sync',
    onDelete: async (resourceId: string) => {
      await remove(`resourcesyncs/${resourceId}`);
      refetch();
    },
  });
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  return (
    <>
      <Toolbar id="resource-sync-toolbar">
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
          <ToolbarItem>
            <TableActions>
              <SelectList>
                <SelectOption isDisabled={!selectedResources.length} onClick={() => setIsMassDeleteModalOpen(true)}>
                  {t('Delete')}
                </SelectOption>
              </SelectList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Resource syncs table')}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
        columns={columns}
        emptyFilters={filteredData.length === 0 && resourceSyncs.length > 0}
        getSortParams={getSortParams}
      >
        <Tbody>
          {sortedData.map((resourceSync, rowIndex) => {
            const rsName = resourceSync.metadata.name as string;
            const rsRef = rsRefs[rsName];
            const isSelected = rsName === selectedRs;
            return (
              <Tr key={rsName} ref={rsRef} className={isSelected ? 'fctl-rslist-row--selected' : ''}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: onRowSelect(resourceSync),
                    isSelected: isRowSelected(resourceSync),
                  }}
                />
                <Td dataLabel={t('Name')}>{rsName}</Td>
                <Td dataLabel={t('Path')}>{resourceSync.spec.path || ''}</Td>
                <Td dataLabel={t('Target revision')}>{resourceSync.spec.targetRevision}</Td>
                <Td dataLabel={t('Status')}>
                  <ResourceSyncStatus resourceSync={resourceSync} />
                </Td>
                <Td dataLabel={t('Observed hash')}>{getObservedHash(resourceSync)}</Td>
                <Td isActionCell>
                  <ActionsColumn items={[deleteAction({ resourceId: resourceSync.metadata.name || '' })]} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {deleteModal}
      {isMassDeleteModalOpen && (
        <MassDeleteResourceSyncModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter((r) => selectedResources.includes(getResourceId(r)))}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </>
  );
};

const ResourceSyncEmptyState = ({ isLoading, error }: { isLoading: boolean; error: string }) => {
  const { t } = useTranslation();
  let content: React.JSX.Element | string = t('This repository does not have associated resource syncs yet');
  if (isLoading) {
    content = <Spinner />;
  } else if (error) {
    content = (
      <span style={{ color: 'var(--pf-v5-global--danger-color--100)' }}>
        {t(`Failed to load the repository's resource syncs`)}
      </span>
    );
  }

  return (
    <EmptyState>
      <EmptyStateBody>{content}</EmptyStateBody>
    </EmptyState>
  );
};

const RepositoryResourceSyncList = ({ repositoryId }: { repositoryId: string }) => {
  const [rsList, isLoading, error, refetch] = useFetchPeriodically<ResourceSyncList>({
    endpoint: `resourcesyncs?labelSelector=repository=${repositoryId}`,
  });

  const items = rsList?.items || [];

  return items.length === 0 ? (
    <ResourceSyncEmptyState isLoading={isLoading} error={error as string} />
  ) : (
    <ResourceSyncTable resourceSyncs={items} refetch={refetch} />
  );
};

export default RepositoryResourceSyncList;
