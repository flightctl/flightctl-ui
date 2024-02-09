import React, { useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from '@patternfly/react-core';

import { FlightControlMetrics, PrometheusMetric } from '@app/types/extraTypes';
import { buildQuery, getMetricSeries } from '@app/utils/metrics';
import { useFetchMetrics } from '@app/hooks/useFetchMetrics';
import TimeLineChart from '@app/components/Metrics/TimeLineChart';

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

  const activeAgents = getMetricSeries(metrics, FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC) || [0, 0];
  const lineSeries = [
    {
      label: 'Active agents',
      themeColor: 'limegreen',
      dataPoints: activeAgents.map(([timestamp, agentCount]) => ({
        name: 'Agents',
        x: `${timestamp}`,
        y: Number(agentCount),
      })),
    },
  ];

  return (
    <Card isCompact={true} isFlat={true}>
      <CardHeader>Active agents in the last X minutes</CardHeader>
      <CardBody>
        <TimeLineChart title="Active agents" lineSeriesList={lineSeries} xTickCount={5} yTickCount={10} />
      </CardBody>
    </Card>
  );
};

export default FleetServiceStatus;
