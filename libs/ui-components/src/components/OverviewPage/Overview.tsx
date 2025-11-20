import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';

import { usePermissionsContext } from '../common/PermissionsContext';
import { useAlertsEnabled } from '../../hooks/useAlertsEnabled';
import { RESOURCE, VERB } from '../../types/rbac';
import PageWithPermissions from '../common/PageWithPermissions';
import { GlobalSystemRestoreBanners } from '../SystemRestore/SystemRestoreBanners';

import AlertsCard from './Cards/Alerts/AlertsCard';
import StatusCard from './Cards/Status/StatusCard';
import TasksCard from './Cards/Tasks/TasksCard';

const overviewPermissions = [
  { kind: RESOURCE.DEVICE, verb: VERB.LIST },
  { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.LIST },
];

const Overview = () => {
  const alertsEnabled = useAlertsEnabled();
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListDevices, canListErs] = checkPermissions(overviewPermissions);

  return (
    <PageWithPermissions allowed={canListDevices || canListErs} loading={loading}>
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
