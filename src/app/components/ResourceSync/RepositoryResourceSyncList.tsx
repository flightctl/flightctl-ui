import * as React from 'react';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { Button, EmptyState, EmptyStateBody, Grid, GridItem, Spinner } from '@patternfly/react-core';

import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { useFetch } from '@app/hooks/useFetch';
import { ResourceSync, ResourceSyncList } from '@types';
import { getObservedHash, getRepositorySyncStatus } from '@app/utils/status/repository';
import StatusInfo from '@app/components/common/StatusInfo';
import CreateRepositoryResourceSync from '@app/components/ResourceSync/CreateResourceSync/CreateRepositoryResourceSync';

const ResourceSyncTable = ({ resourceSyncs, refetch }: { resourceSyncs: ResourceSync[]; refetch: VoidFunction }) => {
  const { remove } = useFetch();

  return (
    <Table aria-label="Repositories table">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Path</Th>
          <Th>Target revision</Th>
          <Th>Status</Th>
          <Th>Observed hash</Th>
          <Td />
        </Tr>
      </Thead>
      <Tbody>
        {resourceSyncs.map((resourceSync) => (
          <Tr key={resourceSync.metadata.name}>
            <Td dataLabel="Name">{resourceSync.metadata.name}</Td>
            <Td dataLabel="Path">{resourceSync.spec.path || ''}</Td>
            <Td dataLabel="Target revision">{resourceSync.spec.targetRevision}</Td>
            <Td dataLabel="Status">
              <StatusInfo statusInfo={getRepositorySyncStatus(resourceSync)} />
            </Td>
            <Td dataLabel="Observed hash">{getObservedHash(resourceSync)}</Td>
            <Td isActionCell>
              <ActionsColumn
                items={[
                  {
                    title: 'Delete',
                    onClick: async () => {
                      await remove(`resourcesync/${resourceSync.metadata.name}`);
                      refetch();
                    },
                  },
                ]}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
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
