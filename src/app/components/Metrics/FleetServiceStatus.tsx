import React, { useState } from 'react';
import { Alert, Badge, Card, CardBody, CardHeader, MenuToggle, MenuToggleElement, Select, SelectList, SelectOption } from '@patternfly/react-core';

import { FlightControlMetrics, PrometheusMetric } from '@app/types/extraTypes';
import { getMetricSeries } from '@app/utils/metrics';
import { useFetchMetrics } from '@app/hooks/useFetchMetrics';
import TimeLineChart from '@app/components/Metrics/TimeLineChart';

const metricNames: FlightControlMetrics[] = [FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC];

const periods = [
  '15m',
  '30m',
  '1h',
  '8h',
  '24h',
  '72h',
];

const FleetServiceStatus = () => {
  const [isOpenFilters, setIsOpenFilters] = useState(false);
  const [chartFilters, setChartFilters ] = useState({ period: '30m' });
  const [metrics, isLoading, error] = useFetchMetrics<PrometheusMetric[]>(metricNames, chartFilters.period);

  const onChartTimeSelect = (_event?: React.MouseEvent<Element, MouseEvent>, selection?: string | number | undefined) => {
    setChartFilters({ period: selection as string });
  }

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
  const maxAgents = activeAgents.reduce((acc, newCountValue) => {
    const newCount = Number(newCountValue[1]);
    return newCount > acc ? newCount : acc;
  }, 0);
  const maxY = Math.ceil(maxAgents * 1.1); // buffer so the line is not cut at the top

  const chartTimeActions = (
    <Select
      aria-label="Chart period"
      role="menu"
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setIsOpenFilters(!isOpenFilters)
          }}
          isExpanded={isOpenFilters}
        >
          Change chart period <Badge isRead>{chartFilters.period}</Badge>
        </MenuToggle>
      )}
      onSelect={onChartTimeSelect}
      selected={chartFilters.period}
      isOpen={isOpenFilters}
      onOpenChange={(isOpen) => setIsOpenFilters(isOpen)}
    >
      <SelectList>
        {periods.map((period) => (
          <SelectOption hasCheckbox key={period} value={period} isSelected={period === chartFilters.period}>
            {period}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  )

  return (
    <Card isCompact={true} isFlat={true}>
      <CardHeader actions={{ actions: chartTimeActions }}>
        Active agents in the last <strong>{chartFilters.period}</strong>
      </CardHeader>
      <CardBody>
        <TimeLineChart title="Active agents" lineSeriesList={lineSeries} xTickCount={10} yTickCount={10} maxY={maxY} />
      </CardBody>
    </Card>
  );
};

export default FleetServiceStatus;
