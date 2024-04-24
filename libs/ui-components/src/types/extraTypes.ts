import { ConditionType, Device, EnrollmentRequest, Fleet, ResourceSync } from '@flightctl/types';

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

export type LabelEditable = Device | Fleet;

export interface FlightCtlLabel {
  key: string;
  value: string | undefined;
}

export interface ApiQuery {
  endpoint: string;
}

export interface MetricsQuery {
  metrics: FlightControlMetrics[];
  period: string;
}

export type FleetConditionType =
  | ConditionType.FleetOverlappingSelectors
  | ConditionType.FleetValid
  | 'Invalid'
  | 'Unknown';

export type FlightControlQuery = ApiQuery | MetricsQuery;

export const isEnrollmentRequest = (resource: Device | EnrollmentRequest): resource is EnrollmentRequest =>
  resource.kind === 'EnrollmentRequest';

export const isFleet = (resource: ResourceSync | Fleet): resource is Fleet => resource.kind === 'Fleet';