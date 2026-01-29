import {
  AuthProvider,
  Condition,
  ConditionType,
  Device,
  EnrollmentRequest,
  FileContent,
  Fleet,
  OAuth2ProviderSpec,
  OIDCProviderSpec,
  RelativePath,
  ResourceKind,
  ResourceSync,
} from '@flightctl/types';
import {
  ImageBuild,
  ImageBuildCondition,
  ImageBuildConditionType,
  ResourceKind as ImageBuilderResourceKind,
  ImageExport,
  ImageExportCondition,
  ImageExportConditionType,
} from '@flightctl/types/imagebuilder';

export interface FlightCtlLabel {
  key: string;
  value?: string;
  isDefault?: boolean;
}

export interface ApiQuery {
  endpoint: string;
  timeout?: number;
}

export type FleetConditionType = ConditionType.FleetValid | 'Invalid' | 'SyncPending';

export enum DeviceAnnotation {
  TemplateVersion = 'fleet-controller/templateVersion',
  RenderedVersion = 'device-controller/renderedVersion',
}

export type GenericCondition = Condition | ImageBuildCondition | ImageExportCondition;
export type GenericConditionType = ConditionType | ImageBuildConditionType | ImageExportConditionType;
export type FlightctlKind = ResourceKind | ImageBuilderResourceKind;

export const isEnrollmentRequest = (resource: Device | EnrollmentRequest): resource is EnrollmentRequest =>
  resource.kind === 'EnrollmentRequest';

export type AnnotationType = DeviceAnnotation; // Add more types when they are added to the API

export const isFleet = (resource: ResourceSync | Fleet): resource is Fleet => resource.kind === 'Fleet';

// ApplicationProviderSpec's definition for inline files adds a Record<string, any>.
// We use the fixed type to get proper Typescript checks for the field
export type InlineApplicationFileFixed = FileContent & RelativePath;

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

// AlertManager alert structure
export type AlertManagerAlert = {
  fingerprint: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
  updatedAt: string;
  status: {
    state: string;
    inhibitedBy: string[];
    mutedBy: string[];
    silencedBy: string[];
  };
  receivers: Array<{ name: string }>;
};

// ImageBuild with the latest exports for each format
export type ImageBuildWithExports = Omit<ImageBuild, 'imageexports'> & {
  imageExports: (ImageExport | undefined)[];
  exportsCount: number;
};

// AuthProviders that can be added dynamically to the system can only be OAuth2 or OIDC.
export type DynamicAuthProviderSpec = OIDCProviderSpec | OAuth2ProviderSpec;
export type DynamicAuthProvider = AuthProvider & { spec: DynamicAuthProviderSpec };

export const isDynamicAuthProvider = (provider: AuthProvider): provider is DynamicAuthProvider =>
  provider.spec.providerType === ProviderType.OIDC || provider.spec.providerType === ProviderType.OAuth2;

export enum ProviderType {
  OIDC = 'oidc',
  OAuth2 = 'oauth2',
  K8s = 'k8s',
  AAP = 'aap',
  OpenShift = 'openshift',
}
