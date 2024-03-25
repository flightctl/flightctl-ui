import { ConditionType, Device, EnrollmentRequest, Fleet } from '@types';

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

// We define separate "ConditionType" for each resource type, given it's generic in the API

export type FleetConditionType =
  | ConditionType.FleetOverlappingSelectors
  | ConditionType.ResourceSyncSynced
  | 'Syncing'
  | 'Unknown';

export type RepositoryConditionType =
  | ConditionType.RepositoryAccessible
  | ConditionType.ResourceSyncResourceParsed
  | ConditionType.ResourceSyncAccessible
  | ConditionType.ResourceSyncSynced;

export type RepositorySyncStatus = RepositoryConditionType | 'NotSynced' | 'NotParsed' | 'NotAccessible' | 'Unknown';

export type FlightControlQuery = ApiQuery | MetricsQuery;

export const isEnrollmentRequest = (resource: Device | EnrollmentRequest): resource is EnrollmentRequest =>
  resource.kind === 'EnrollmentRequest';
