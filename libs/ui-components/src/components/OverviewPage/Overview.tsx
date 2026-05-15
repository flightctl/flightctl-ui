import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';

import { usePermissionsContext } from '../common/PermissionsContext';
import { useAlertsEnabled, useVulnerabilitiesEnabled } from '../../hooks/useServicesEnabled';
import { RESOURCE, VERB } from '../../types/rbac';
import PageWithPermissions from '../common/PageWithPermissions';
import { GlobalSystemRestoreBanners } from '../SystemRestore/SystemRestoreBanners';

import AlertsCard from './Cards/Alerts/AlertsCard';
import StatusCard from './Cards/Status/StatusCard';
import TasksCard from './Cards/Tasks/TasksCard';
import SecurityOverviewCard from './Cards/SecurityOverview/SecurityOverviewCard';

const overviewPermissions = [
  { kind: RESOURCE.DEVICE, verb: VERB.LIST },
  { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.LIST },
];

const Overview = () => {
  const [alertsEnabled] = useAlertsEnabled();
  const [vulnerabilitiesEnabled, canListVulnerabilities, vulnerabilitiesLoading] = useVulnerabilitiesEnabled();
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListDevices, canListErs] = checkPermissions(overviewPermissions);
  const vulnColumns = vulnerabilitiesEnabled && canListErs ? 6 : 12;

  return (
    <PageWithPermissions
      allowed={canListDevices || canListErs || canListVulnerabilities}
      loading={loading || vulnerabilitiesLoading}
    >
      <GlobalSystemRestoreBanners className="pf-v6-u-py-0" />

      <Grid hasGutter>
        <GridItem md={alertsEnabled ? 9 : 12}>
          <Grid hasGutter>
            {canListDevices && (
              <GridItem>
                <StatusCard />
              </GridItem>
            )}
            {vulnerabilitiesEnabled && canListVulnerabilities && (
              <GridItem lg={vulnColumns}>
                <SecurityOverviewCard />
              </GridItem>
            )}
            {canListErs && (
              <GridItem lg={vulnColumns}>
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
