import * as React from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateBody,
  Spinner,
  Stack,
} from '@patternfly/react-core';
import { CubeIcon } from '@patternfly/react-icons/dist/js/icons/cube-icon';

import { type SpecCatalogItemId, formatCatalogItemRef } from '../../utils/catalog';
import { useTranslation } from '../../hooks/useTranslation';
import { useCatalogItemsContext } from './CatalogItemsContext';
import { resolveSpecCatalogItem } from './specCatalogItems';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import InstalledSoftwareItem from './InstalledSoftwareItem';

type InstalledSoftwareProps = {
  hasPackageMode?: boolean;
  onDeleteItem: (id: SpecCatalogItemId) => Promise<void>;
  onEdit: (id: SpecCatalogItemId) => void;
  canEdit: boolean;
};

const InstalledSoftware = ({ onDeleteItem, onEdit, canEdit, hasPackageMode }: InstalledSoftwareProps) => {
  const { t } = useTranslation();
  const [itemToDelete, setItemToDelete] = React.useState<SpecCatalogItemId | undefined>();
  const { catalogItemIds, getItem, isLoading, error } = useCatalogItemsContext();

  const softwareItems = React.useMemo(
    () =>
      catalogItemIds
        .filter((id) => id.type === 'os' || id.type === 'app')
        .map((id) => ({ id, data: resolveSpecCatalogItem(id, getItem) })),
    [catalogItemIds, getItem],
  );

  if (isLoading) {
    return <EmptyState titleText={t('Loading installed software')} headingLevel="h4" icon={Spinner} />;
  }
  if (error) {
    return <Alert isInline variant="danger" title={t('Failed to load installed software')} />;
  }

  const isEmpty = softwareItems.length === 0;

  return (
    <>
      <Card>
        <CardTitle>{t('Deployed Software')}</CardTitle>
        <CardBody>
          {isEmpty ? (
            <EmptyState headingLevel="h4" icon={CubeIcon} titleText={t('No software deployed')}>
              <EmptyStateBody>
                {hasPackageMode
                  ? t('Select an application from the catalog below.')
                  : t('Select an operating system or application from the catalog below.')}
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <Stack hasGutter>
              {softwareItems.map(({ id, data }, index) => (
                <React.Fragment key={id.type === 'app' ? id.appName : 'os'}>
                  {index > 0 && <Divider />}
                  <InstalledSoftwareItem
                    catalogItemId={id}
                    data={data}
                    onEdit={() => onEdit(id)}
                    onDelete={() => {
                      setItemToDelete(id);
                    }}
                    canEdit={canEdit}
                  />
                </React.Fragment>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>
      {itemToDelete && (
        <DeleteModal
          onClose={() => setItemToDelete(undefined)}
          onDelete={async () => {
            await onDeleteItem(itemToDelete);
            setItemToDelete(undefined);
          }}
          resourceName={
            itemToDelete.type === 'os' ? formatCatalogItemRef(itemToDelete.ref) : (itemToDelete.appName as string)
          }
          resourceType={itemToDelete.type === 'os' ? t('operating system') : t('application')}
        />
      )}
    </>
  );
};

export default InstalledSoftware;
