import React from 'react';
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
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link, useNavigate } from 'react-router-dom';

import { RepositoryList } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { useFetch } from '@app/hooks/useFetch';
import ListPageBody from '@app/components/ListPage/ListPageBody';
import ListPage from '@app/components/ListPage/ListPage';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '@app/utils/status/repository';
import StatusInfo from '@app/components/common/StatusInfo';
import { useDeleteListAction } from '../ListPage/ListPageActions';

const CreateRepositoryButton = () => {
  const navigate = useNavigate();

  return (
    <Button variant="primary" onClick={() => navigate('/administration/repositories/create')}>
      Create
    </Button>
  );
};

const RepositoryEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>You haven&apos;t created any repositories yet</>} headingLevel="h4" />
    <EmptyStateBody>Create a new repository using the &quot;Create&quot; button</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <CreateRepositoryButton />
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

const RepositoryTable = () => {
  const [repositoryList, loading, error, refetch] = useFetchPeriodically<RepositoryList>({ endpoint: 'repositories' });
  const { remove } = useFetch();
  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Repository',
    onDelete: async (resourceId: string) => {
      await remove(`repositories/${resourceId}`);
      refetch();
    },
  });

  return (
    <ListPageBody data={repositoryList?.items} error={error} loading={loading} emptyState={<RepositoryEmptyState />}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <CreateRepositoryButton />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Repositories table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Url</Th>
            <Th>Sync status</Th>
            <Th>Last transition</Th>
            <Td />
          </Tr>
        </Thead>
        <Tbody>
          {repositoryList?.items.map((repository) => (
            <Tr key={repository.metadata.name}>
              <Td dataLabel="Name">
                <Link to={`${repository.metadata.name}`}>{repository.metadata.name}</Link>
              </Td>
              <Td dataLabel="Url">{repository.spec.repo || '-'}</Td>
              <Td dataLabel="Sync status">
                <StatusInfo statusInfo={getRepositorySyncStatus(repository)} />
              </Td>
              <Td dataLabel="Last transition">{getRepositoryLastTransitionTime(repository)}</Td>
              <Td isActionCell>
                <ActionsColumn items={[deleteAction({ resourceId: repository.metadata.name || '' })]} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {deleteModal}
    </ListPageBody>
  );
};

const RepositoryList = () => {
  return (
    <ListPage title="Repositories">
      <RepositoryTable />
    </ListPage>
  );
};

export default RepositoryList;
