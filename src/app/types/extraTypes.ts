export enum FlightControlMetrics {
  ACTIVE_AGENT_COUNT_METRIC = 'flightctl_devicesimulator_active_agent_count',
  TOTAL_API_REQUESTS_METRIC = 'flightctl_devicesimulator_api_requests_total',
}

export type MetricValue = [number, number | string];

export interface PrometheusMetric {
  metric: {
    __name__: FlightControlMetrics;
    job: string;
  };
  value?: MetricValue;
  values?: Array<MetricValue>;
}

export interface AppEvent {
  title: string;
  type: 'info' | 'warning' | 'error' | 'action';
  content: string;
  timestamp: string;
}

export interface ApiQuery {
  endpoint: string;
}

export interface MetricsQuery {
  metrics: FlightControlMetrics[];
  period: string;
}

export type FlightControlQuery = ApiQuery | MetricsQuery;