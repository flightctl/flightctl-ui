import * as React from 'react';
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Grid,
  GridItem,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useLocation } from 'react-router';

import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { useFetch } from '@app/hooks/useFetch';
import { ResourceSync, ResourceSyncList } from '@types';
import { getObservedHash, getRepositorySyncStatus } from '@app/utils/status/repository';
import StatusInfo from '@app/components/common/StatusInfo';
import CreateRepositoryResourceSync from '@app/components/ResourceSync/CreateResourceSync/CreateRepositoryResourceSync';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { useTableSort } from '@app/hooks/useTableSort';
import { sortByName } from '@app/utils/sort/generic';
import {
  sortResourceSyncsByHash,
  sortResourceSyncsByPath,
  sortResourceSyncsByRevision,
  sortResourceSyncsByStatus,
} from '@app/utils/sort/resourceSync';
import Table, { TableColumn } from '../Table/Table';
import { useTableTextSearch } from '@app/hooks/useTableTextSearch';
import TableTextSearch from '../Table/TableTextSearch';

import './RepositoryResourceSyncList.css';

const columns: TableColumn<ResourceSync>[] = [
  {
    name: 'Name',
    onSort: sortByName,
  },
  {
    name: 'Path',
    onSort: sortResourceSyncsByPath,
  },
  {
    name: 'Target revision',
    onSort: sortResourceSyncsByRevision,
  },
  {
    name: 'Status',
    onSort: sortResourceSyncsByStatus,
  },
  {
    name: 'Observed hash',
    onSort: sortResourceSyncsByHash,
  },
];

const createRefs = (rsList: ResourceSync[]) => {
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
  const { remove } = useFetch();
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

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Resource Sync',
    onDelete: async (resourceId: string) => {
      await remove(`resourcesyncs/${resourceId}`);
      refetch();
    },
  });

  const { filteredData, search, setSearch } = useTableTextSearch(resourceSyncs, getSearchText);

  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  return (
    <>
      <Toolbar id="resource-sync-toolbar">
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Repositories table" columns={columns} data={filteredData} getSortParams={getSortParams}>
        <Tbody>
          {sortedData.map((resourceSync) => {
            const rsName = resourceSync.metadata.name as string;
            const rsRef = rsRefs[rsName];
            const isSelected = rsName === selectedRs;
            return (
              <Tr key={rsName} ref={rsRef} className={isSelected ? 'fctl_rslist-row--selected' : ''}>
                <Td dataLabel="Name">{rsName}</Td>
                <Td dataLabel="Path">{resourceSync.spec.path || ''}</Td>
                <Td dataLabel="Target revision">{resourceSync.spec.targetRevision}</Td>
                <Td dataLabel="Status">
                  <StatusInfo statusInfo={getRepositorySyncStatus(resourceSync)} />
                </Td>
                <Td dataLabel="Observed hash">{getObservedHash(resourceSync)}</Td>
                <Td isActionCell>
                  <ActionsColumn items={[deleteAction({ resourceId: rsName || '' })]} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {deleteModal}
    </>
  );
};

const ResourceSyncEmptyState = ({ isLoading, error }: { isLoading: boolean; error: string }) => {
  let content: React.JSX.Element | string = 'This repository does not have associated resource syncs yet';
  if (isLoading) {
    content = <Spinner />;
  } else if (error) {
    content = (
      <span style={{ color: 'var(--pf-v5-global--danger-color--100)' }}>
        Failed to load the repository&apos;s resource syncs
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
  const [isFormVisible, setIsFormVisible] = React.useState<boolean>(false);
  const [rsList, isLoading, error, refetch] = useFetchPeriodically<ResourceSyncList>({
    endpoint: `resourcesyncs?labelSelector=repository=${repositoryId}`,
  });

  const items = rsList?.items || [];

  const onResourceSyncCreated = () => {
    setIsFormVisible(false);
    refetch();
  };

  return (
    <Grid hasGutter>
      <GridItem>
        {items.length === 0 ? (
          <ResourceSyncEmptyState isLoading={isLoading} error={error as string} />
        ) : (
          <ResourceSyncTable resourceSyncs={items} refetch={refetch} />
        )}
      </GridItem>
      {!isLoading && (
        <GridItem>
          {isFormVisible ? (
            <CreateRepositoryResourceSync
              repositoryId={repositoryId}
              onSuccess={onResourceSyncCreated}
              onCancel={() => {
                setIsFormVisible(false);
              }}
            />
          ) : (
            <Button
              variant="link"
              onClick={() => {
                setIsFormVisible(true);
              }}
              icon={<PlusCircleIcon />}
            >
              Add a new resource sync
            </Button>
          )}
        </GridItem>
      )}
    </Grid>
  );
};

export default RepositoryResourceSyncList;
