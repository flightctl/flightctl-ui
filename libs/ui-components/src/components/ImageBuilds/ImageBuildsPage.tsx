import * as React from 'react';
import { TFunction } from 'i18next';
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
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import PlusIcon from '@patternfly/react-icons/dist/js/icons/plus-icon';

import { RESOURCE, VERB } from '../../types/rbac';
import { useTableSelect } from '../../hooks/useTableSelect';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import PageWithPermissions from '../common/PageWithPermissions';
import { usePermissionsContext } from '../common/PermissionsContext';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import TablePagination from '../Table/TablePagination';
import TableTextSearch from '../Table/TableTextSearch';
import Table, { ApiSortTableColumn } from '../Table/Table';

import MassDeleteImageBuildModal from '../modals/massModals/MassDeleteImageBuildModal/MassDeleteImageBuildModal';
import DeleteImageBuildModal from './DeleteImageBuildModal/DeleteImageBuildModal';
import { useImageBuilds, useImageBuildsBackendFilters } from './useImageBuilds';
import ImageBuildRow from './ImageBuildRow';
import { OciRegistriesContextProvider } from './OciRegistriesContext';

const getColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Name'),
  },
  {
    name: t('Base image'),
  },
  {
    name: t('Image output'),
  },
  {
    name: t('Status'),
  },
  {
    name: t('Export images'),
  },
  {
    name: t('Date'),
  },
];

const imageBuildTablePermissions = [
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.DELETE },
];

const ImageBuildsEmptyState = ({ onCreateClick }: { onCreateClick?: VoidFunction }) => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={PlusCircleIcon} titleText={t('There are no image builds in your environment.')}>
      <EmptyStateBody>{t('Generate system images for consistent deployment to edge devices.')}</EmptyStateBody>
      {onCreateClick && (
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant="primary" onClick={onCreateClick} icon={<PlusIcon />}>
              {t('Build new image')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      )}
    </ResourceListEmptyState>
  );
};

const ImageBuildTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const imageBuildColumns = React.useMemo(() => getColumns(t), [t]);
  const { name, setName, hasFiltersEnabled } = useImageBuildsBackendFilters();

  const { imageBuilds, isLoading, error, isUpdating, refetch, pagination } = useImageBuilds({ name });

  const [imageBuildToDeleteId, setImageBuildToDeleteId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

  const { onRowSelect, isAllSelected, hasSelectedRows, isRowSelected, setAllSelected } = useTableSelect();

  const { checkPermissions } = usePermissionsContext();
  const [canCreate, canDelete] = checkPermissions(imageBuildTablePermissions);

  const handleCreateClick = React.useCallback(() => {
    navigate(ROUTE.IMAGE_BUILD_CREATE);
  }, [navigate]);

  return (
    <ListPageBody error={error} loading={isLoading}>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <TableTextSearch value={name || ''} setValue={setName} placeholder={t('Search by name')} />
            </ToolbarItem>
          </ToolbarGroup>
          {canCreate && (
            <ToolbarItem>
              <Button variant="primary" onClick={handleCreateClick}>
                {t('Build new image')}
              </Button>
            </ToolbarItem>
          )}
          {canDelete && (
            <ToolbarItem>
              <Button isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)} variant="secondary">
                {t('Delete image builds')}
              </Button>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Image builds table')}
        loading={isUpdating}
        columns={imageBuildColumns}
        hasFilters={hasFiltersEnabled}
        emptyData={imageBuilds.length === 0}
        clearFilters={() => setName('')}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
        isExpandable
      >
        {imageBuilds.map((imageBuild, rowIndex) => {
          const name = imageBuild.metadata.name || '';
          return (
            <ImageBuildRow
              key={name}
              imageBuild={imageBuild}
              rowIndex={rowIndex}
              canCreate={canCreate}
              canDelete={canDelete}
              onDeleteClick={() => {
                setImageBuildToDeleteId(name);
              }}
              isRowSelected={() => isRowSelected(imageBuild)}
              onRowSelect={() => onRowSelect(imageBuild)}
              refetch={refetch}
            />
          );
        })}
      </Table>
      <TablePagination pagination={pagination} isUpdating={isUpdating} />
      {!isUpdating && imageBuilds.length === 0 && !name && (
        <ImageBuildsEmptyState onCreateClick={canCreate ? handleCreateClick : undefined} />
      )}

      {imageBuildToDeleteId && (
        <DeleteImageBuildModal
          imageBuildId={imageBuildToDeleteId}
          onClose={(hasDeleted) => {
            setImageBuildToDeleteId(undefined);
            if (hasDeleted) {
              refetch();
            }
          }}
        />
      )}
      {isMassDeleteModalOpen && (
        <MassDeleteImageBuildModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          imageBuilds={imageBuilds.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </ListPageBody>
  );
};

const ImageBuildsPage = () => {
  const { t } = useTranslation();

  return (
    <ListPage title={t('Image builds')}>
      <ImageBuildTable />
    </ListPage>
  );
};

const ImageBuildsPageWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.IMAGE_BUILD, verb: VERB.LIST }]);

  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <OciRegistriesContextProvider>
        <ImageBuildsPage />
      </OciRegistriesContextProvider>
    </PageWithPermissions>
  );
};

export default ImageBuildsPageWithPermissions;
