import {
  AppType,
  ApplicationEnvVars,
  ApplicationVolumeProviderSpec,
  ConditionType,
  Device,
  EnrollmentRequest,
  FileContent,
  Fleet,
  ImageApplicationProviderSpec,
  RelativePath,
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
  isDefault?: boolean;
}

export interface ApiQuery {
  endpoint: string;
  timeout?: number;
}

export interface MetricsQuery {
  metrics: FlightControlMetrics[];
  period: string;
}

export type FleetConditionType = ConditionType.FleetValid | 'Invalid' | 'SyncPending';

export type FlightControlQuery = ApiQuery | MetricsQuery;

export enum DeviceAnnotation {
  TemplateVersion = 'fleet-controller/templateVersion',
  RenderedVersion = 'device-controller/renderedVersion',
}

export const isEnrollmentRequest = (resource: Device | EnrollmentRequest): resource is EnrollmentRequest =>
  resource.kind === 'EnrollmentRequest';

export type AnnotationType = DeviceAnnotation; // Add more types when they are added to the API

export const isFleet = (resource: ResourceSync | Fleet): resource is Fleet => resource.kind === 'Fleet';

// ApplicationProviderSpec's definition for inline files adds a Record<string, any>. We use the fixed types to get full Typescript checks for the field
export type InlineApplicationFileFixed = FileContent & RelativePath;

// "FixedApplicationProviderSpec" will need to be manually adjusted whenever the API definition changes
export type ApplicationProviderSpecFixed = ApplicationEnvVars &
  ApplicationVolumeProviderSpec & {
    name?: string;
    appType?: AppType;
  } & (ImageApplicationProviderSpec | { inline: InlineApplicationFileFixed[] });

type CliArtifact = {
  os: string;
  arch: string;
  filename: string;
  sha256: string;
};

export type CliArtifactsResponse = {
  baseUrl: string;
  artifacts: CliArtifact[];
};
