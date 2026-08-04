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

import { DeviceSpec } from '@flightctl/types';
import { formatCatalogItemRef } from '../../utils/catalog';
import { useTranslation } from '../../hooks/useTranslation';
import { SpecOsCatalogItem, useSpecCatalogItems } from './useSpecCatalogItems';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import InstalledSoftwareItem from './InstalledSoftwareItem';

const getOsDisplayName = (os: SpecOsCatalogItem) => {
  const osItem = os.data?.item;
  return osItem?.spec.displayName || osItem?.metadata.name || formatCatalogItemRef(os.ref);
};

type InstalledSoftwareProps = {
  hasPackageMode?: boolean;
  spec: DeviceSpec | undefined;
  onDeleteOs: () => Promise<void>;
  onDeleteApp: (appName: string) => Promise<void>;
  onEdit: (catalogId: string, catalogItemId: string, appName?: string) => void;
  canEdit: boolean;
};

const InstalledSoftware = ({
  spec,
  onDeleteOs,
  onDeleteApp,
  onEdit,
  canEdit,
  hasPackageMode,
}: InstalledSoftwareProps) => {
  const { t } = useTranslation();
  const [deleteOs, setDeleteOs] = React.useState(false);
  const [appToDelete, setAppToDelete] = React.useState<string>();
  const { os, apps, error, isLoading } = useSpecCatalogItems(spec);

  if (isLoading) {
    return <EmptyState titleText={t('Loading installed software')} headingLevel="h4" icon={Spinner} />;
  }
  if (error) {
    return <Alert isInline variant="danger" title={t('Failed to load installed software')} />;
  }

  const hasOs = !!os;
  const hasApps = apps.length > 0;
  const isEmpty = !hasOs && !hasApps;

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
              {hasOs && (
                <InstalledSoftwareItem
                  entry={os}
                  onEdit={() => onEdit(os.ref.catalog, os.ref.item || '')}
                  onDelete={() => setDeleteOs(true)}
                  canEdit={canEdit}
                />
              )}
              {apps.map((app, index) => (
                <React.Fragment key={app.appName}>
                  {(hasOs || index > 0) && <Divider />}
                  <InstalledSoftwareItem
                    entry={app}
                    onEdit={() => onEdit(app.ref.catalog, app.ref.item || '', app.appName)}
                    onDelete={() => setAppToDelete(app.appName)}
                    canEdit={canEdit}
                  />
                </React.Fragment>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>
      {deleteOs && os && (
        <DeleteModal
          onClose={() => setDeleteOs(false)}
          onDelete={async () => {
            await onDeleteOs();
            setDeleteOs(false);
          }}
          resourceName={getOsDisplayName(os)}
          resourceType={t('operating system')}
        />
      )}
      {appToDelete && (
        <DeleteModal
          onClose={() => setAppToDelete(undefined)}
          onDelete={async () => {
            await onDeleteApp(appToDelete);
            setAppToDelete(undefined);
          }}
          resourceName={appToDelete}
          resourceType={t('application')}
        />
      )}
    </>
  );
};

export default InstalledSoftware;
