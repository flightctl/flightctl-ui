import React, { useState } from 'react';
import { Alert, Flex, FlexItem } from '@patternfly/react-core';

import { DevicesDonuts } from '@app/old/Overview/devicesDonuts';
import { Legend } from '@app/old/Overview/legend';
import { buildQuery, getMetricNumericValue } from '@app/utils/metrics';
import { useFetchMetrics } from '@app/hooks/useFetchMetrics';
import { FlightControlMetrics, PrometheusMetric } from '@app/types/extraTypes';

const metricNames: FlightControlMetrics[] = [
  FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC,
];

const FleetServiceStatus = () => {
  const [metricsQuery /*, _setMetricsQuery */] = useState<string>(buildQuery({
    metrics: metricNames,
    range: {
      from: 1707473202,
      to: 1707474102,
      step: 3, // one value every 3 seconds
    },
  }));

  const [metrics, isLoading, error] = useFetchMetrics<PrometheusMetric[]>(metricsQuery);
  if (isLoading) {
    return <div>Loading chart...</div>
  }
  if (error) {
    return <Alert variant="danger" title="An error occured" isInline />;
  }
  if (!metrics) {
    // TODO empty state for the chart?
    return <Alert variant="warning" title="No data available" isInline />;
  }

  let activeAgents = getMetricNumericValue(metrics, FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC) || 0;
  if (activeAgents < 200) {
    // Faking that there are more devices, as we are getting all values the same
    activeAgents = 200;
  }

  const enrollmentRequests = getMetricNumericValue(metrics, FlightControlMetrics.TOTAL_API_REQUESTS_METRIC, {
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
