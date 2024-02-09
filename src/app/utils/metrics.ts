import { FlightControlMetrics, MetricValue, PrometheusMetric } from '@app/types/extraTypes';

const getMetricSeries = (metrics: PrometheusMetric[], name: string): MetricValue[] => {
  const metricItem = metrics.find((metric) => {
    if (metric.metric.__name__ !== name) {
      return false;
    }
    return true;
  });
  return metricItem?.values || [];
};

const buildQuery = ({
  metrics,
  range,
}: {
  metrics: FlightControlMetrics[];
  range?: { from: number; to: number; step: number };
}) => {
  let query = metrics.length === 1 ? metrics[0] : `__name__=~"${metrics.join('|')}"`;
  if (range) {
    query += `&start=${range.from}&end=${range.to}&step=${range.step}`;
  }
  return query;
};

export { buildQuery, getMetricSeries };
