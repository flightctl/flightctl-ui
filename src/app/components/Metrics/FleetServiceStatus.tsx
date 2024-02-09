import React, { useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from '@patternfly/react-core';

import { buildQuery, getMetricNumericValue } from '@app/utils/metrics';
import { useFetchMetrics } from '@app/hooks/useFetchMetrics';
import { FlightControlMetrics, PrometheusMetric } from '@app/types/extraTypes';
import LineChart from '@app/components/Metrics/LineChart';

const metricNames: FlightControlMetrics[] = [FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC];

const FleetServiceStatus = () => {
  const [metricsQuery /*, _setMetricsQuery */] = useState<string>(
    buildQuery({
      metrics: metricNames,
      range: {
        from: 1707473202,
        to: 1707474102,
        step: 3, // one value every 3 seconds
      },
    }),
  );

  const [metrics, isLoading, error] = useFetchMetrics<PrometheusMetric[]>(metricsQuery);
  if (isLoading) {
    return <div>Loading chart...</div>;
  }
  if (error) {
    return <Alert variant="danger" title="An error occured" isInline />;
  }
  if (!metrics) {
    // TODO empty state for the chart?
    return <Alert variant="warning" title="No data available" isInline />;
  }

  const activeAgents = getMetricNumericValue(metrics, FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC) || 0;

  const enrollmentRequests =
    getMetricNumericValue(metrics, FlightControlMetrics.TOTAL_API_REQUESTS_METRIC, {
      operation: 'create_enrollmentrequest',
    }) || 0;

  const activeAgentSeries = [
    { name: 'First', x: '5', y: 2 },
    { name: 'First', x: '10', y: 16 },
    { name: 'First', x: '15', y: 12 },
  ];
  const anotherSeries = [
    { name: 'Second', x: '5', y: 15 },
    { name: 'Second', x: '10', y: 11 },
    { name: 'Second', x: '15', y: 18 },
  ];

  const lineSeries = [
    {
      label: 'Active agents',
      themeColor: 'limegreen',
      dataPoints: activeAgentSeries.map((dataPoint) => ({ name: 'Active agents', x: dataPoint.x, y: dataPoint.y })),
    },
    {
      label: 'Another measurement',
      themeColor: 'cornflowerblue',
      dataPoints: anotherSeries.map((dataPoint) => ({ name: 'Active agents', x: dataPoint.x, y: dataPoint.y })),
    },
  ];

  return (
    <Card isCompact={true} isFlat={true}>
      <CardHeader>Active agents in the last X minutes</CardHeader>
      <CardBody>
        <LineChart
          title="Hey you"
          ariaTitle="yourself"
          lineSeriesList={lineSeries}
          xAxisTicks={[1, 5, 10]}
          yAxisTicks={[10, 15, 20]}
        />
      </CardBody>
    </Card>
  );
};

export default FleetServiceStatus;
