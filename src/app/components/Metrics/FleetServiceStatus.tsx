import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import { FlightControlMetrics, MetricsQuery, PrometheusMetric } from '@app/types/extraTypes';
import { getMetricSeries } from '@app/utils/metrics';
import TimeLineChart from '@app/components/Metrics/TimeLineChart';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getErrorMessage } from '@app/utils/error';

import './FleetServiceStatus.css';

const defaultMetric = FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC;
const periods = ['15m', '30m', '1h', '8h', '24h', '72h'];

const FleetServiceStatus = () => {
  const [isOpenFilters, setIsOpenFilters] = useState(false);
  const [metricsQuery, setMetricsQuery] = useState<MetricsQuery>({ metrics: [defaultMetric], period: '30m' });
  const [metrics, isFirstLoad, error, , isRefreshing] = useFetchPeriodically<PrometheusMetric[]>(metricsQuery);
  const isUpdatingData = isFirstLoad || isRefreshing;
  const hasMetrics = !!metrics?.length;

  const onChartTimeSelect = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    selectedPeriod?: string | number | undefined,
  ) => {
    setMetricsQuery({ metrics: [defaultMetric], period: selectedPeriod as string });
  };

  const activeAgents = getMetricSeries(metrics || [], FlightControlMetrics.ACTIVE_AGENT_COUNT_METRIC) || [0, 0];
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
            setIsOpenFilters(!isOpenFilters);
          }}
          isExpanded={isOpenFilters}
        >
          Change chart period <Badge isRead>{metricsQuery.period}</Badge>
        </MenuToggle>
      )}
      onSelect={onChartTimeSelect}
      selected={metricsQuery.period}
      isOpen={isOpenFilters}
      onOpenChange={(isOpen) => setIsOpenFilters(isOpen)}
    >
      <SelectList>
        {periods.map((period) => (
          <SelectOption hasCheckbox key={period} value={period} isSelected={period === metricsQuery.period}>
            {period}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );

  return (
    <Card isCompact={true} isFlat={true}>
      <CardHeader actions={{ actions: chartTimeActions }}>
        Active agents in the last <strong>{metricsQuery.period}</strong>
      </CardHeader>

      <CardBody>
        {isFirstLoad && !hasMetrics && (
          <Bullseye>
            <Spinner />
          </Bullseye>
        )}
        {!isFirstLoad && isRefreshing && <Spinner className="fctl-floating_spinner" size="lg" />}

        {!isUpdatingData && error ? (
          <Alert variant="danger" title="Service status update failed" className="pf-v5-u-py-md" isInline isPlain>
            {getErrorMessage(error)}
          </Alert>
        ) : null}
        {hasMetrics ? (
          <TimeLineChart
            title="Active agents"
            lineSeriesList={lineSeries}
            xTickCount={10}
            yTickCount={10}
            maxY={maxY}
          />
        ) : null}

        {!isFirstLoad && !hasMetrics && !error ? (
          <EmptyState>
            <EmptyStateBody>No metrics exist for the selected period</EmptyStateBody>
          </EmptyState>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default FleetServiceStatus;
