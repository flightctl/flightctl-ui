import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
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

const RepositoryEmptyState = () => (
  <EmptyState>
    <EmptyStateHeader titleText={<>You haven&apos;t created any repositories yet</>} headingLevel="h4" />
    <EmptyStateBody>Create a new repository using the &quot;Create&quot; button</EmptyStateBody>
  </EmptyState>
);

const RepositoryTable = () => {
  const navigate = useNavigate();
  const [repositoryList, loading, error, refetch] = useFetchPeriodically<RepositoryList>({ endpoint: 'repositories' });
  const { remove } = useFetch();

  return (
    <ListPageBody data={repositoryList?.items} error={error} loading={loading} emptyState={<RepositoryEmptyState />}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Button variant="primary" onClick={() => navigate('/administration/repositories/create')}>
              Create
            </Button>
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
                <ActionsColumn
                  items={[
                    {
                      title: 'Delete',
                      onClick: async () => {
                        await remove(`repositories/${repository.metadata.name}`);
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
