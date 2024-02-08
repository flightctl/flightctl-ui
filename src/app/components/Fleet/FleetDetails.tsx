import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Button, PageSection, Title } from '@patternfly/react-core';
import { RedoIcon } from '@patternfly/react-icons';
import { Fleet } from '@types';

import { useSingleFetch } from '@app/hooks/useSingleFetch';
import { useFetch } from '@app/hooks/useFetch';
import { PrometheusMetric } from '@app/types/extraTypes';

import FleetDetailsContent from './FleetDetailsContent';

const metrics = [
  'flightctl_devicesimulator_active_agent_count',
  'flightctl_devicesimulator_api_requests_total'
];

const FleetDetails = () => {
  const { fleetId } = useParams();
  const { getMetrics } = useFetch(); // TODO should be periodically too
  const [fleetDetails, isLoading, error] = useSingleFetch<Required<Fleet>>(`fleets/${fleetId}`);
  const [fleetMetrics, setFleetMetrics] = useState<PrometheusMetric[]>([]);

  const refreshMetrics = React.useCallback(() => {
    getMetrics(metrics).then((metric) => {
      setFleetMetrics(metric);
    });
  }, [getMetrics])

  React.useEffect(() => {
    refreshMetrics();
  },
    // To load the metrics initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);


  if (error && !fleetDetails) {
    return <div>Failed to retrieve fleet details</div>;
  }
  if (isLoading || fleetDetails === undefined) {
    return <div>Loading...</div>;
  }

  // TODO handle case when there's an error after having loaded fleetDetails previously. Show alert?
  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem to="/devicemanagement/fleets">Fleets</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          {fleetId}
        </BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="3xl">
        {fleetId}
        <span className="pf-v5-u-font-size-md">
          <Button
            onClick={refreshMetrics}
            icon={<RedoIcon />}
            variant="plain"
          />
        </span>
      </Title>

      <FleetDetailsContent fleet={fleetDetails} metrics={fleetMetrics} />
    </PageSection>
  );
};

export default FleetDetails;
