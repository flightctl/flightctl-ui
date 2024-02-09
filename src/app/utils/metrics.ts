import { FlightControlMetrics, PrometheusMetric } from '@app/types/extraTypes';

type MetricValue = string | number | undefined;

const getMetricValue = (metrics: PrometheusMetric[], name: string, filters?: Record<string, string>): MetricValue => {
  const metricItem = metrics.find((metric) => {
    if (metric.metric.__name__ !== name) {
      return false;
    }
    if (filters) {
      // If the name matches, check if there are extra filters to apply
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        return metric.metric[filterKey] === filterValue;
      });
    }
    return true;
  });

  let value: MetricValue;
  if (metricItem?.value?.length) {
    value = metricItem.value[1];
  }
  return value;
}

const getMetricNumericValue = (metrics: PrometheusMetric[], name: string, filters?: Record<string, string>): number | undefined => {
  const value = getMetricValue(metrics, name, filters);
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

const buildQuery = ({ metrics, range }: { metrics: FlightControlMetrics[], range?: { from: number, to: number, step: number } }) => {
  let query = metrics.length === 1 ? metrics[0] : `__name__=~"${metrics.join('|')}"`;
  if (range) {
    query += `&start=${range.from}&end=${range.to}&step=${range.step}`;
  }
  return query;
}

export {
  buildQuery,
  getMetricValue,
  getMetricNumericValue,
}
