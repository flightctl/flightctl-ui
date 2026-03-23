import * as React from 'react';
import { ResourceSyncType } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE } from '../../../hooks/useNavigate';
import ImportResourceWizard from '../../ImportResourceWizard/ImportResourceWizard';

const ImportFleetWizard = () => {
  const { t } = useTranslation();
  return (
    <ImportResourceWizard
      resourceSyncType={ResourceSyncType.ResourceSyncTypeFleet}
      successRoute={ROUTE.FLEETS}
      breadcrumb={{ label: t('Fleets'), route: ROUTE.FLEETS }}
      title={t('Import fleets')}
      resourceSyncDescription={t(
        'A resource sync is an automated Gitops method that helps manage your imported fleets by monitoring source repository changes and updating your fleet configuration accordingly.',
      )}
      reviewInfoText={t(
        'Fleets will appear in the fleets table list and their status will be reflecting the resource sync process status. After a few minutes, they should be synced and enabled.',
      )}
    />
  );
};

export default ImportFleetWizard;
