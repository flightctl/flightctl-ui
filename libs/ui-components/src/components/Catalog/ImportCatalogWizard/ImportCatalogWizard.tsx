import * as React from 'react';
import { ResourceSyncType } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE } from '../../../hooks/useNavigate';
import ImportResourceWizard from '../../ImportResourceWizard/ImportResourceWizard';

const ImportCatalogWizard = () => {
  const { t } = useTranslation();
  return (
    <ImportResourceWizard
      resourceSyncType={ResourceSyncType.ResourceSyncTypeCatalog}
      successRoute={ROUTE.CATALOG}
      breadcrumb={{ label: t('Software Catalog'), route: ROUTE.CATALOG }}
      title={t('Import catalogs')}
      resourceSyncDescription={t(
        'A resource sync is an automated Gitops method that helps manage your imported catalog by monitoring source repository changes and updating your catalog configuration accordingly.',
      )}
    />
  );
};

export default ImportCatalogWizard;
