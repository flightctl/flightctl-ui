import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import StatusCard from './Cards/Status/StatusCard';
import ToDoCard from './Cards/ToDo/ToDoCard';
import { useAccessReview } from '../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../types/rbac';
import PageWithPermissions from '../common/PageWithPermissions';

const Overview = () => {
  const [canListDevices, devicesLoading] = useAccessReview(RESOURCE.DEVICE, VERB.LIST);
  const [canListErs, erLoading] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST, VERB.LIST);

  return (
    <PageWithPermissions allowed={canListDevices || canListErs} loading={devicesLoading || erLoading}>
      <Grid hasGutter>
        {canListDevices && (
          <GridItem>
            <StatusCard />
          </GridItem>
        )}
        {canListErs && (
          <GridItem md={6} lg={4}>
            <ToDoCard />
          </GridItem>
        )}
      </Grid>
    </PageWithPermissions>
  );
};

export default Overview;
