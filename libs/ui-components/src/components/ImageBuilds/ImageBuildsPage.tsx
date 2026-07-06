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
import Table from '../Table/Table';

import MassDeleteImageBuildModal from '../modals/massModals/MassDeleteImageBuildModal/MassDeleteImageBuildModal';
import CancelImageBuildModal from './CancelImageBuildModal/CancelImageBuildModal';
import DeleteImageBuildModal from './DeleteImageBuildModal/DeleteImageBuildModal';
import { useImageBuildLatestPromotions, useImageBuilds, useImageBuildsBackendFilters } from './useImageBuilds';
import ImageBuildRow from './ImageBuildRow';
import { OciRegistriesContextProvider } from './OciRegistriesContext';
import ImagePromotionModal from '../ImagePromotion/ImagePromotionModal';
import { ImageBuildWithExports } from '../../types/extraTypes';

const getColumns = (t: TFunction) => [
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
    name: t('Build status'),
  },
  {
    name: t('Promotion status'),
  },
  {
    name: t('Date'),
  },
];

const imageBuildTablePermissions = [
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD_CANCEL, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.DELETE },
  { kind: RESOURCE.IMAGE_BUILD_NEW_VERSION, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.LIST },
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
  const { onRowSelect, isAllSelected, hasSelectedRows, isRowSelected, setAllSelected } = useTableSelect();

  const { checkPermissions } = usePermissionsContext();
  const [canCreate, canCancel, canDelete, canNewVersion, canPromote, canListPromotions] =
    checkPermissions(imageBuildTablePermissions);

  const buildNames = React.useMemo(
    () => (canListPromotions ? imageBuilds.map((b) => b.metadata.name || '').filter(Boolean) : []),
    [canListPromotions, imageBuilds],
  );
  const [latestPromotionsByBuild, refetchPromotions] = useImageBuildLatestPromotions(buildNames);

  const [imageBuildToDeleteId, setImageBuildToDeleteId] = React.useState<string>();
  const [imageBuildToCancelId, setImageBuildToCancelId] = React.useState<string>();
  const [imageBuildtoCatalog, setImageBuildToCatalog] = React.useState<ImageBuildWithExports>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);

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
              canDelete={canDelete}
              canCancel={canCancel}
              canNewVersion={canNewVersion}
              onDeleteClick={() => {
                setImageBuildToDeleteId(name);
              }}
              onCancelClick={() => setImageBuildToCancelId(name)}
              onNewVersionClick={() => navigate({ route: ROUTE.IMAGE_BUILD_NEW_VERSION, postfix: name })}
              isRowSelected={() => isRowSelected(imageBuild)}
              onRowSelect={() => onRowSelect(imageBuild)}
              onAddToCatalog={() => setImageBuildToCatalog(imageBuild)}
              canAddToCatalog={canPromote}
              refetch={refetch}
              latestPromotion={latestPromotionsByBuild[name]}
            />
          );
        })}
      </Table>
      <TablePagination pagination={pagination} isUpdating={isUpdating} />
      {!isUpdating && imageBuilds.length === 0 && !name && (
        <ImageBuildsEmptyState onCreateClick={canCreate ? handleCreateClick : undefined} />
      )}

      {imageBuildToCancelId && (
        <CancelImageBuildModal
          imageBuildId={imageBuildToCancelId}
          onClose={(confirmed) => {
            setImageBuildToCancelId(undefined);
            if (confirmed) {
              refetch();
            }
          }}
        />
      )}
      {imageBuildtoCatalog && (
        <ImagePromotionModal
          onClose={(updated) => {
            setImageBuildToCatalog(undefined);
            if (updated) {
              refetchPromotions();
            }
          }}
          imageBuild={imageBuildtoCatalog}
        />
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
            setAllSelected(false);
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
