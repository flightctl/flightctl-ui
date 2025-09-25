import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';

import { useAccessReview } from '../../hooks/useAccessReview';
import { useAlertsEnabled } from '../../hooks/useAlertsEnabled';
import { RESOURCE, VERB } from '../../types/rbac';
import PageWithPermissions from '../common/PageWithPermissions';
import { GlobalSystemRestoreBanners } from '../SystemRestore/SystemRestoreBanners';

import AlertsCard from './Cards/Alerts/AlertsCard';
import StatusCard from './Cards/Status/StatusCard';
import TasksCard from './Cards/Tasks/TasksCard';

const Overview = () => {
  const alertsEnabled = useAlertsEnabled();
  const [canListDevices, devicesLoading] = useAccessReview(RESOURCE.DEVICE, VERB.LIST);
  const [canListErs, erLoading] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST, VERB.LIST);

  return (
    <PageWithPermissions allowed={canListDevices || canListErs} loading={devicesLoading || erLoading}>
      <GlobalSystemRestoreBanners className="pf-v5-u-py-0" />

      <Grid hasGutter>
        <GridItem md={alertsEnabled ? 9 : 12}>
          <Grid hasGutter>
            {canListDevices && (
              <GridItem>
                <StatusCard />
              </GridItem>
            )}
            {canListErs && (
              <GridItem md={9} lg={6}>
                <TasksCard />
              </GridItem>
            )}
          </Grid>
        </GridItem>
        {alertsEnabled && (
          <GridItem md={3}>
            <AlertsCard />
          </GridItem>
        )}
      </Grid>
    </PageWithPermissions>
  );
};

export default Overview;
