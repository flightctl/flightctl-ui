import React from 'react';
import {
  Button,
  DropdownList,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Link, useNavigate } from 'react-router-dom';
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import { RepositoryIcon } from '@patternfly/react-icons/dist/js/icons/repository-icon';

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
import ResourceListEmptyState from '@app/components/common/ResourceListEmptyState';

const CreateRepositoryButton = ({ buttonText }: { buttonText?: string }) => {
  const navigate = useNavigate();

  return (
    <Button variant="primary" onClick={() => navigate('/devicemanagement/repositories/create')}>
      {buttonText || 'Create a repository'}
    </Button>
  );
};

const RepositoryEmptyState = () => (
  <ResourceListEmptyState icon={RepositoryIcon} titleText="No repositories here!">
    <EmptyStateBody>
      You can create repositories and use them to point to Git repositories.
      <br />
      Adding resource syncs to them will allow you to keep your fleet&apos;s configurations updated and synced
      automatically.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <CreateRepositoryButton />
      </EmptyStateActions>
    </EmptyStateFooter>
  </ResourceListEmptyState>
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

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    setDeleteModalRepoId(undefined);
    refetch();
  };

  const { search, setSearch, filteredData } = useTableTextSearch(repositoryList?.items || [], getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, selectedResources, isAllSelected, isRowSelected, setAllSelected } = useTableSelect(sortedData);

  return (
    <ListPageBody error={error} loading={loading}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <TableTextSearch value={search} setValue={setSearch} />
          </ToolbarItem>
          <ToolbarItem>
            <CreateRepositoryButton buttonText="Create repository" />
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
        emptyFilters={filteredData.length === 0 && (repositoryList?.items.length || 0) > 0}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
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
                      title: 'Edit',
                      onClick: () => navigate(`/devicemanagement/repositories/edit/${repository.metadata.name}`),
                    },
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
      {repositoryList?.items.length === 0 && <RepositoryEmptyState />}
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
    <ListPage title="Repositories">
      <RepositoryTable />
    </ListPage>
  );
};

export default RepositoryList;
