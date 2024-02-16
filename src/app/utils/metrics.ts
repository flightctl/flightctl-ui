import { MetricValue, PrometheusMetric } from '@app/types/extraTypes';

const getMetricSeries = (metrics: PrometheusMetric[], name: string): MetricValue[] => {
  const metricItem = metrics.find((metric) => {
    if (metric.metric.__name__ !== name) {
      return false;
    }
    return true;
  });
  return metricItem?.values || [];
};

// TODO use a standard library for the calculation
const getPeriodTimestamps = (period: string) => {
  const to = Date.now();

  let step = 5;

  let from: number;
  switch (period) {
    case '15m':
      from = to - 15 * 60 * 1000;
      break;
    case '30m':
      from = to - 30 * 60 * 1000;
      break;
    case '1h':
      from = to - 1 * 60 * 60 * 1000;
      step = 20;
      break;
    case '8h':
      from = to - 8 * 60 * 60 * 1000;
      step = 30;
      break;
    case '24h':
      step = 120;
      from = to - 24 * 60 * 60 * 1000;
      break;
    case '72h':
    default:
      step = 600;
      from = to - 72 * 60 * 60 * 1000;
      break;
  }
  // Prometheus query requires seconds, not milliseconds
  return { from: from / 1000, to: to / 1000, step };
};

export { getMetricSeries, getPeriodTimestamps };
