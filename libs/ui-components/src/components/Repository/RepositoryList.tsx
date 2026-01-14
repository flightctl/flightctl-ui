import React from 'react';
import {
  Button,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ActionsColumn, IAction, OnSelect, Tbody, Td, Tr } from '@patternfly/react-table';
import { RepositoryIcon } from '@patternfly/react-icons/dist/js/icons/repository-icon';
import { TFunction } from 'i18next';

import { RepoSpecType, Repository } from '@flightctl/types';
import ListPageBody from '../ListPage/ListPageBody';
import ListPage from '../ListPage/ListPage';
import { getLastTransitionTimeText, getRepositorySyncStatus } from '../../utils/status/repository';
import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import DeleteRepositoryModal from './RepositoryDetails/DeleteRepositoryModal';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { TableColumn } from '../Table/Table';
import { useTableSelect } from '../../hooks/useTableSelect';
import MassDeleteRepositoryModal from '../modals/massModals/MassDeleteRepositoryModal/MassDeleteRepositoryModal';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import ResourceLink from '../common/ResourceLink';
import RepositoryStatus from '../Status/RepositoryStatus';
import PageWithPermissions from '../common/PageWithPermissions';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import { useRepositories } from './useRepositories';
import TablePagination from '../Table/TablePagination';
import { getRepoTypeLabel, getRepoUrlOrRegistry } from './CreateRepository/utils';

const CreateRepositoryButton = ({ buttonText }: { buttonText?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermissions } = usePermissionsContext();
  const [canCreate] = checkPermissions([{ kind: RESOURCE.REPOSITORY, verb: VERB.CREATE }]);

  return (
    canCreate && (
      <Button variant="primary" onClick={() => navigate(ROUTE.REPO_CREATE)}>
        {buttonText || t('Create a repository')}
      </Button>
    )
  );
};

const RepositoryEmptyState = () => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={RepositoryIcon} titleText={t('No repositories here!')}>
      <EmptyStateBody>
        {t(
          'Repositories make it easier to keep your fleet configurations updated and automatically synced to your devices.',
        )}
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
  },
  {
    name: t('Type'),
  },
  {
    name: t('URL'),
  },
  {
    name: t('Sync status'),
  },
  {
    name: t('Last transition'),
  },
];

const getSearchText = (repo: Repository) => [repo.metadata.name];

const RepositoryTableRow = ({
  repository,
  canDelete,
  canEdit,
  rowIndex,
  setDeleteModalRepoId,
  onRowSelect,
  isRowSelected,
}: {
  repository: Repository;
  canDelete: boolean;
  canEdit: boolean;
  rowIndex: number;
  setDeleteModalRepoId: (repoId?: string) => void;
  onRowSelect: (repository: Repository) => OnSelect;
  isRowSelected: (repository: Repository) => boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions: IAction[] = [];
  if (canEdit) {
    actions.push({
      title: t('Edit repository'),
      onClick: () => navigate({ route: ROUTE.REPO_EDIT, postfix: repository.metadata.name }),
    });
  }
  if (canDelete) {
    actions.push({
      title: t('Delete repository'),
      onClick: () => setDeleteModalRepoId(repository.metadata.name),
    });
  }
  return (
    <Tr>
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
      <Td dataLabel={t('Type')}>{getRepoTypeLabel(t, repository.spec.type)}</Td>
      <Td dataLabel={repository.spec.type === RepoSpecType.OCI ? t('Registry') : t('URL')}>
        {getRepoUrlOrRegistry(repository.spec) || '-'}
      </Td>
      <Td dataLabel={t('Sync status')}>
        <RepositoryStatus statusInfo={getRepositorySyncStatus(repository)} />
      </Td>
      <Td dataLabel={t('Last transition')}>{getLastTransitionTimeText(repository, t).text}</Td>
      {!!actions.length && (
        <Td isActionCell>
          <ActionsColumn items={actions} />
        </Td>
      )}
    </Tr>
  );
};

const repositoryTablePermissions = [
  { kind: RESOURCE.REPOSITORY, verb: VERB.DELETE },
  { kind: RESOURCE.REPOSITORY, verb: VERB.PATCH },
];
const RepositoryTable = () => {
  const { t } = useTranslation();
  const [repositories, loading, error, isUpdating, refetch, pagination] = useRepositories();
  const [deleteModalRepoId, setDeleteModalRepoId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  const onDeleteSuccess = () => {
    setDeleteModalRepoId(undefined);
    refetch();
  };

  const { search, setSearch, filteredData } = useTableTextSearch(repositories, getSearchText);
  const columns = React.useMemo(() => getColumns(t), [t]);

  const { hasSelectedRows, isAllSelected, isRowSelected, setAllSelected, onRowSelect } = useTableSelect<Repository>();

  const { checkPermissions } = usePermissionsContext();
  const [canDelete, canEdit] = checkPermissions(repositoryTablePermissions);

  return (
    <ListPageBody error={error} loading={loading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <TableTextSearch value={search} setValue={setSearch} />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <CreateRepositoryButton buttonText={t('Create repository')} />
          </ToolbarItem>
          {canDelete && (
            <ToolbarItem>
              <Button isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)} variant="secondary">
                {t('Delete repositories')}
              </Button>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Repositories table')}
        loading={isUpdating}
        hasFilters={!!search}
        emptyData={filteredData.length === 0}
        clearFilters={() => setSearch('')}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
        columns={columns}
      >
        <Tbody>
          {filteredData.map((repository, rowIndex) => (
            <RepositoryTableRow
              key={repository.metadata.name}
              repository={repository}
              rowIndex={rowIndex}
              canDelete={canDelete}
              canEdit={canEdit}
              setDeleteModalRepoId={setDeleteModalRepoId}
              isRowSelected={isRowSelected}
              onRowSelect={onRowSelect}
            />
          ))}
        </Tbody>
      </Table>
      <TablePagination isUpdating={isUpdating} pagination={pagination} />

      {repositories.length === 0 && <RepositoryEmptyState />}
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
          repositories={filteredData.filter(isRowSelected)}
        />
      )}
    </ListPageBody>
  );
};

const RepositoryList = () => {
  const { t } = useTranslation();
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.REPOSITORY, verb: VERB.LIST }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <ListPage title={t('Repositories')}>
        <RepositoryTable />
      </ListPage>
    </PageWithPermissions>
  );
};

export default RepositoryList;
