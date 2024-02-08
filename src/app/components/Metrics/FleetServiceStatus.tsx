import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';

import { PrometheusMetric } from '@app/types/extraTypes';

import { DevicesDonuts } from '@app/old/Overview/devicesDonuts';
import { Legend } from '@app/old/Overview/legend';
import { getMetricNumericValue } from '@app/utils/metrics';

const FleetServiceStatus = ( { metrics }: { metrics: PrometheusMetric[] } ) => {
  let activeAgents = getMetricNumericValue(metrics, 'flightctl_devicesimulator_active_agent_count') || 0;
  if (activeAgents < 200) {
    // Faking that there are more devices, as we are getting all values the same
    activeAgents = 200;
  }

  const enrollmentRequests = getMetricNumericValue(metrics, 'flightctl_devicesimulator_api_requests_total', {
    operation: 'create_enrollmentrequest',
  }) || 0;

  // Generate some random numbers based on the reduced info we have
  const syncing = enrollmentRequests === activeAgents ? 0 : Math.floor(activeAgents * 0.6);
  const errors = enrollmentRequests === activeAgents ? 0 : Math.floor(activeAgents * 0.25);
  const offline = enrollmentRequests === activeAgents ? 0 : Math.floor(activeAgents * 0.12);
  const degraded = enrollmentRequests === activeAgents ? 0 : (activeAgents - enrollmentRequests - syncing - errors - offline);

  const devicesStatus = {
    'Ready': { count: activeAgents === 0 ? 0 : enrollmentRequests },
    'Error': { count: activeAgents === 0 ? 0 : errors },
    'Syncing': { count: activeAgents === 0 ? 0 : syncing },
    'Offline': { count: activeAgents === 0 ? 0 : offline },
    'Degraded': { count: activeAgents === 0 ? 0 : degraded },
  }

  return (
    <Flex alignItems={{ default: "alignItemsCenter" }} justifyContent={{ default: 'justifyContentSpaceAround' }}>
      <FlexItem>
        <DevicesDonuts fleetDevicesStatus={devicesStatus} totalDevices={activeAgents}></DevicesDonuts>
      </FlexItem>
      <FlexItem>
        <Legend />
      </FlexItem>
    </Flex>
  )
}

export default FleetServiceStatus;
