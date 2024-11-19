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
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import { RepositoryIcon } from '@patternfly/react-icons/dist/js/icons/repository-icon';
import { TFunction } from 'i18next';

import { RepoSpecType, Repository, RepositoryList } from '@flightctl/types';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import ListPageBody from '../ListPage/ListPageBody';
import ListPage from '../ListPage/ListPage';
import { getLastTransitionTimeText, getRepositorySyncStatus } from '../../utils/status/repository';
import { useTableSort } from '../../hooks/useTableSort';
import { sortByName } from '../../utils/sort/generic';
import * as repoSort from '../../utils/sort/repository';
import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import DeleteRepositoryModal from './RepositoryDetails/DeleteRepositoryModal';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';
import TableActions from '../Table/TableActions';
import { useTableSelect } from '../../hooks/useTableSelect';
import MassDeleteRepositoryModal from '../modals/massModals/MassDeleteRepositoryModal/MassDeleteRepositoryModal';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import ResourceLink from '../common/ResourceLink';
import RepositoryStatus from '../Status/RepositoryStatus';

const CreateRepositoryButton = ({ buttonText }: { buttonText?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button variant="primary" onClick={() => navigate(ROUTE.REPO_CREATE)}>
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
    name: t('Type'),
    onSort: repoSort.sortRepositoriesByType,
  },
  {
    name: t('Url'),
    onSort: repoSort.sortRepositoriesByUrl,
  },
  {
    name: t('Sync status'),
    onSort: repoSort.sortRepositoriesBySyncStatus,
  },
  {
    name: t('Last transition'),
    onSort: repoSort.sortRepositoriesByLastTransition,
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

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  return (
    <ListPageBody error={error} loading={loading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={search} setValue={setSearch} />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <CreateRepositoryButton buttonText={t('Create repository')} />
          </ToolbarItem>
          <ToolbarItem>
            <TableActions isDisabled={!hasSelectedRows}>
              <DropdownList>
                <SelectOption onClick={() => setIsMassDeleteModalOpen(true)}>{t('Delete')}</SelectOption>
              </DropdownList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Repositories table')}
        loading={loading}
        emptyFilters={filteredData.length === 0}
        emptyData={(repositoryList?.items.length || 0) === 0}
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
                <ResourceLink id={repository.metadata.name as string} routeLink={ROUTE.REPO_DETAILS} />
              </Td>
              <Td dataLabel={t('Type')}>
                {repository.spec.type === RepoSpecType.HTTP ? t('HTTP service') : t('Git repository')}
              </Td>
              <Td dataLabel={t('Url')}>{repository.spec.url || '-'}</Td>
              <Td dataLabel={t('Sync status')}>
                <RepositoryStatus statusInfo={getRepositorySyncStatus(repository)} />
              </Td>
              <Td dataLabel={t('Last transition')}>{getLastTransitionTimeText(repository, t).text}</Td>
              <Td isActionCell>
                <ActionsColumn
                  items={[
                    {
                      title: t('Edit repository'),
                      onClick: () => navigate({ route: ROUTE.REPO_EDIT, postfix: repository.metadata.name }),
                    },
                    {
                      title: t('Delete repository'),
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
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
          repositories={sortedData.filter(isRowSelected)}
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
