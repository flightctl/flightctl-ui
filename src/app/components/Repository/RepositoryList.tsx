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
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import { Link, useNavigate } from 'react-router-dom';

import { Repository, RepositoryList } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import ListPageBody from '@app/components/ListPage/ListPageBody';
import ListPage from '@app/components/ListPage/ListPage';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '@app/utils/status/repository';
import StatusInfo from '@app/components/common/StatusInfo';
import { useTableSort } from '@app/hooks/useTableSort';
import { sortByName } from '@app/utils/sort/generic';
import {
  sortRepositoriesByLastTransition,
  sortRepositoriesBySyncStatus,
  sortRepositoriesByUrl,
} from '@app/utils/sort/repository';
import { useTableTextSearch } from '@app/hooks/useTableTextSearch';
import RepositoryCustomDeleteModal from './RepositoryDetails/RepositoryCustomDeleteModal';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';

const CreateRepositoryButton = () => {
  const navigate = useNavigate();

  return (
    <Button variant="primary" onClick={() => navigate('/devicemanagement/repositories/create')}>
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

const columns: TableColumn<Repository>[] = [
  {
    name: 'Name',
    onSort: sortByName,
  },
  {
    name: 'Url',
    onSort: sortRepositoriesByUrl,
  },
  {
    name: 'Sync status',
    onSort: sortRepositoriesBySyncStatus,
  },
  {
    name: 'Last transition',
    onSort: sortRepositoriesByLastTransition,
  },
];

const getSearchText = (repo: Repository) => [repo.metadata.name];

const RepositoryTable = () => {
  const [repositoryList, loading, error, refetch] = useFetchPeriodically<RepositoryList>({ endpoint: 'repositories' });
  const [deleteModalRepoId, setDeleteModalRepoId] = React.useState<string>();

  const onDeleteSuccess = () => {
    setDeleteModalRepoId(undefined);
    refetch();
  };

  const { search, setSearch, filteredData } = useTableTextSearch(repositoryList?.items || [], getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  return (
    <ListPageBody data={repositoryList?.items} error={error} loading={loading} emptyState={<RepositoryEmptyState />}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Repositories table" data={filteredData} columns={columns} getSortParams={getSortParams}>
        <Tbody>
          {sortedData.map((repository) => (
            <Tr key={repository.metadata.name}>
              <Td dataLabel="Name">
                <Link to={`${repository.metadata.name}`}>{repository.metadata.name}</Link>
              </Td>
              <Td dataLabel="Url">{repository.spec.repo || '-'}</Td>
              <Td dataLabel="Sync status">
                <StatusInfo statusInfo={getRepositorySyncStatus(repository)} />
              </Td>
              <Td dataLabel="Last transition">{getRepositoryLastTransitionTime(repository).text}</Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: 'Delete',
                      onClick: () => setDeleteModalRepoId(repository.metadata.name),
                    },
                  ]}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {!!deleteModalRepoId && (
        <RepositoryCustomDeleteModal
          onClose={() => setDeleteModalRepoId(undefined)}
          onDeleteSuccess={onDeleteSuccess}
          repositoryId={deleteModalRepoId}
        />
      )}
    </ListPageBody>
  );
};

const RepositoryList = () => {
  return (
    <ListPage title="Repositories" actions={<CreateRepositoryButton />}>
      <RepositoryTable />
    </ListPage>
  );
};

export default RepositoryList;
