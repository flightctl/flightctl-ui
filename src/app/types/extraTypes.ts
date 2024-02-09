export enum FlightControlMetrics {
  ACTIVE_AGENT_COUNT_METRIC = 'flightctl_devicesimulator_active_agent_count',
  TOTAL_API_REQUESTS_METRIC = 'flightctl_devicesimulator_api_requests_total',
}

export interface PrometheusMetric {
  metric: {
    __name__: FlightControlMetrics;
    job: string;
  };
  value: Array<string | number>;
}
