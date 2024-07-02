import {
  ConditionType,
  Device,
  EnrollmentRequest,
  Fleet,
  GitHttpRepoSpec,
  GitSshRepoSpec,
  RepositorySpec,
  ResourceSync,
} from '@flightctl/types';

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

export interface FlightCtlLabel {
  key: string;
  value?: string;
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
  | 'SyncPending';

export type FlightControlQuery = ApiQuery | MetricsQuery;

export enum DeviceAnnotation {
  TemplateVersion = 'fleet-controller/templateVersion',
  MultipleOwners = 'fleet-controller/multipleOwners',
  RenderedVersion = 'device-controller/renderedVersion',
}

export type AnnotationType = DeviceAnnotation; // Add more types when they are added to the API

export type DeviceLikeResource = Device | EnrollmentRequest;

export const isEnrollmentRequest = (resource: DeviceLikeResource): resource is EnrollmentRequest =>
  resource.kind === 'EnrollmentRequest';

export const isFleet = (resource: ResourceSync | Fleet): resource is Fleet => resource.kind === 'Fleet';

export const isHttpRepoSpec = (repoSpec: RepositorySpec): repoSpec is GitHttpRepoSpec => !!repoSpec['httpConfig'];
export const isSshRepoSpec = (repoSpec: RepositorySpec): repoSpec is GitSshRepoSpec => !!repoSpec['sshConfig'];
