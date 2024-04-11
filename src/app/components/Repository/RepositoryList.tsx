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
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const CreateRepositoryButton = ({ buttonText }: { buttonText?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button variant="primary" onClick={() => navigate('/devicemanagement/repositories/create')}>
      {buttonText || t('Create a repository')}
    </Button>
  );
};

const RepositoryEmptyState = () => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={RepositoryIcon} titleText={t('No repositories here!')}>
      <EmptyStateBody>
        <>
          {t('You can create repositories and use them to point to Git repositories.')}
          <br />
          {t(` Adding resource syncs to them will allow you to keep your fleet's configurations updated and synced
          automatically.`)}
        </>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <CreateRepositoryButton />
        </EmptyStateActions>
      </EmptyStateFooter>
    </ResourceListEmptyState>
  );
};

const getColumns = (t: TFunction): TableColumn<Repository>[] => [
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('Url'),
    onSort: sortRepositoriesByUrl,
  },
  {
    name: t('Sync status'),
    onSort: sortRepositoriesBySyncStatus,
  },
  {
    name: t('Last transition'),
    onSort: sortRepositoriesByLastTransition,
  },
];

const getSearchText = (repo: Repository) => [repo.metadata.name];

const RepositoryTable = () => {
  const { t } = useTranslation();
  const [repositoryList, loading, error, refetch] = useFetchPeriodically<RepositoryList>({ endpoint: 'repositories' });
  const [deleteModalRepoId, setDeleteModalRepoId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    setDeleteModalRepoId(undefined);
    refetch();
  };

  const { search, setSearch, filteredData } = useTableTextSearch(repositoryList?.items || [], getSearchText);

  const columns = React.useMemo(() => getColumns(t), [t]);
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
            <CreateRepositoryButton buttonText={t('Create repository')} />
          </ToolbarItem>
          <ToolbarItem>
            <TableActions>
              <DropdownList>
                <SelectOption isDisabled={!selectedResources.length} onClick={() => setIsMassDeleteModalOpen(true)}>
                  {t('Delete')}
                </SelectOption>
              </DropdownList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Repositories table')}
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
              <Td dataLabel={t('Name')}>
                <Link to={`${repository.metadata.name}`}>{repository.metadata.name}</Link>
              </Td>
              <Td dataLabel={t('Url')}>{repository.spec.repo || '-'}</Td>
              <Td dataLabel={t('Sync status')}>
                <StatusInfo statusInfo={getRepositorySyncStatus(repository)} />
              </Td>
              <Td dataLabel={t('Last transition')}>{getRepositoryLastTransitionTime(repository).text}</Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: t('Edit'),
                      onClick: () => navigate(`/devicemanagement/repositories/edit/${repository.metadata.name}`),
                    },
                    {
                      title: t('Delete'),
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
  const { t } = useTranslation();
  return (
    <ListPage title={t('Repositories')}>
      <RepositoryTable />
    </ListPage>
  );
};

export default RepositoryList;
