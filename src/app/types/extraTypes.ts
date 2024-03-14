import { ConditionType } from '@types';

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

// We define separate "ConditionType" for each resource type, given it's generic in the API
export type FleetConditionType = 'Synced' | 'Syncing'; // TODO reference values from the API when they are defined
export type RepositoryConditionType =
  | ConditionType.RepositoryAccessible
  | ConditionType.ResourceSyncResourceParsed
  | ConditionType.ResourceSyncAccessible
  | ConditionType.ResourceSyncSynced;

export type FleetUpdateStatus = 'Synced' | 'Syncing' | 'Unknown';
export type RepositorySyncStatus = RepositoryConditionType | 'NotSynced' | 'NotParsed' | 'NotAccessible' | 'Unknown';

export type FlightControlQuery = ApiQuery | MetricsQuery;
