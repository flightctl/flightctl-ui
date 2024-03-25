import React from 'react';
import {
  Button,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  SelectOption,
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
import DeleteRepositoryModal from './RepositoryDetails/DeleteRepositoryModal';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';
import TableActions from '../Table/TableActions';
import { useTableSelect } from '@app/hooks/useTableSelect';
import { getResourceId } from '@app/utils/resource';
import MassDeleteRepositoryModal from '../modals/massModals/MassDeleteRepositoryModal/MassDeleteRepositoryModal';

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
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  const onDeleteSuccess = () => {
    setDeleteModalRepoId(undefined);
    refetch();
  };

  const { search, setSearch, filteredData } = useTableTextSearch(repositoryList?.items || [], getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, selectedResources, isAllSelected, isRowSelected, setAllSelected } = useTableSelect(sortedData);

  return (
    <ListPageBody
      isEmpty={!repositoryList?.items || repositoryList.items.length === 0}
      error={error}
      loading={loading}
      emptyState={<RepositoryEmptyState />}
    >
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
          <ToolbarItem>
            <TableActions>
              <DropdownList>
                <SelectOption isDisabled={!selectedResources.length} onClick={() => setIsMassDeleteModalOpen(true)}>
                  Delete
                </SelectOption>
              </DropdownList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label="Repositories table"
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
        data={filteredData}
        columns={columns}
        getSortParams={getSortParams}
      >
        <Tbody>
          {sortedData.map((repository, rowIndex) => (
            <Tr key={repository.metadata.name}>
              <Td
                select={{
                  rowIndex,
                  onSelect: onRowSelect(repository),
                  isSelected: isRowSelected(repository),
                }}
              />
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
        <DeleteRepositoryModal
          onClose={() => setDeleteModalRepoId(undefined)}
          onDeleteSuccess={onDeleteSuccess}
          repositoryId={deleteModalRepoId}
        />
      )}
      {isMassDeleteModalOpen && (
        <MassDeleteRepositoryModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          onDeleteSuccess={refetch}
          repositories={sortedData.filter((d) => selectedResources.includes(getResourceId(d)))}
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
