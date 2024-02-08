export interface PrometheusMetric {
  metric: {
    __name__: string;
    job: string;
  },
  value: Array<string|number>
}


