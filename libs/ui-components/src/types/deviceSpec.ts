import {
  AppType,
  ArtifactApplicationProviderSpec,
  ConfigProviderSpec,
  DisruptionBudget,
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  ImageApplicationProviderSpec,
  ImagePullPolicy,
  InlineApplicationProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
} from '@flightctl/types';
import { FlightCtlLabel } from './extraTypes';
import { UpdateScheduleMode } from '../utils/time';
import { ApplicationProviderSpecFixed } from './extraTypes';

export enum ConfigType {
  GIT = 'git',
  HTTP = 'http',
  K8S_SECRET = 'secret',
  INLINE = 'inline',
}

export type ConfigTemplate = {
  type: ConfigType;
  name: string;
};

export type GitConfigTemplate = ConfigTemplate & {
  type: ConfigType.GIT;
  repository: string;
  targetRevision: string;
  path: string;
};

export enum AppSpecType {
  OCI_IMAGE = 'image',
  INLINE = 'inline',
}

type InlineContent = {
  content?: string;
  path: string;
  base64?: boolean;
};

type AppBase = {
  specType: AppSpecType;
  appType?: AppType;
  name?: string;
  variables: { name: string; value: string }[];
  volumes?: {
    name: string;
    reference: string;
    pullPolicy?: ImagePullPolicy;
  }[];
};

export type InlineAppForm = AppBase & {
  name: string; // name can only be optional for image applications
  files: InlineContent[];
  // UI-only: inline format selector; defaults to 'compose' | 'quadlet'. Adds 'container'.
  inlineFormat?: 'compose' | 'quadlet' | 'container';
  // UI-only: structured fields for container quadlet generation
  container?: {
    image: string;
    ports: { hostPort: number; containerPort: number; protocol?: 'tcp' | 'udp' }[];
    mounts: { name: string; mountPath: string }[];
    memory?: string; // e.g. 512M, 1G
    cpuQuota?: string; // e.g. 50%, 100000
    cpuWeight?: number; // 1-10000
  };
};

export type ImageAppForm = AppBase & {
  image: string;
};

export const isGitConfigTemplate = (configTemplate: ConfigTemplate): configTemplate is GitConfigTemplate =>
  configTemplate.type === ConfigType.GIT;

export const isGitProviderSpec = (providerSpec: ConfigProviderSpec): providerSpec is GitConfigProviderSpec =>
  'gitRef' in providerSpec;

export type ConfigSourceProvider =
  | GitConfigProviderSpec
  | KubernetesSecretProviderSpec
  | InlineConfigProviderSpec
  | HttpConfigProviderSpec;

export type RepoConfig = GitConfigProviderSpec | HttpConfigProviderSpec;

export const isRepoConfig = (config: ConfigSourceProvider): config is RepoConfig =>
  isGitProviderSpec(config) || isHttpProviderSpec(config);

export type AppForm = ImageAppForm | InlineAppForm;

export const isInlineAppProvider = (app: ApplicationProviderSpecFixed): app is InlineApplicationProviderSpec =>
  'inline' in app;
export const isImageAppProvider = (app: ApplicationProviderSpecFixed): app is ImageApplicationProviderSpec =>
  'image' in app;
export const isArtifactAppProvider = (app: ApplicationProviderSpecFixed): app is ArtifactApplicationProviderSpec =>
  'artifact' in app;

export const isImageAppForm = (app: AppBase): app is ImageAppForm => app.specType === AppSpecType.OCI_IMAGE;
export const isInlineAppForm = (app: AppBase): app is InlineAppForm => app.specType === AppSpecType.INLINE;

const hasTemplateVariables = (str: string) => /{{.+?}}/.test(str);

export const getAppIdentifier = (app: AppForm) => {
  if (isImageAppForm(app)) {
    return app.name || app.image;
  }
  // Name is mandatory for inline applications
  return app.name;
};

const removeSlashes = (url: string | undefined) => (url || '').replace(/^\/+|\/+$/g, '');
const getFinalRepoUrl = (baseUrl: string, relativePath: string) => {
  if (relativePath && !hasTemplateVariables(relativePath)) {
    return `${baseUrl}/${relativePath}`;
  }
  return baseUrl;
};

export const getConfigFullRepoUrl = (config: RepoConfig, repositoryUrl: string) => {
  const baseUrl = removeSlashes(repositoryUrl).replace(/\.git\/?$/, '');
  if (isHttpProviderSpec(config)) {
    return getFinalRepoUrl(baseUrl, removeSlashes(config.httpRef.suffix));
  }
  if (isGitProviderSpec(config) && /github|gitlab/.test(repositoryUrl)) {
    const configPath = removeSlashes(config.gitRef.path);
    const pathSegments = configPath.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Extension-less files cannot be identified as such. GitHub and Gitlab both redirect to the correct URL to show the file contents
    const fileOrDir = lastSegment.includes('.') ? 'blob' : 'tree';
    return getFinalRepoUrl(baseUrl, `${fileOrDir}/${config.gitRef.targetRevision}/${configPath}`);
  }

  // We return just the base repository URL as a fallback
  return baseUrl;
};

export const getRepoName = (config: RepoConfig) =>
  isGitProviderSpec(config) ? config.gitRef.repository : config.httpRef.repository;

export type KubeSecretTemplate = ConfigTemplate & {
  type: ConfigType.K8S_SECRET;
  secretName: string;
  secretNs: string;
  mountPath: string;
};

export const isKubeSecretTemplate = (configTemplate: ConfigTemplate): configTemplate is KubeSecretTemplate =>
  configTemplate.type === ConfigType.K8S_SECRET;

export const isKubeProviderSpec = (providerSpec: ConfigProviderSpec): providerSpec is KubernetesSecretProviderSpec =>
  'secretRef' in providerSpec;

export type InlineConfigTemplate = ConfigTemplate & {
  type: ConfigType.INLINE;
  files: Array<InlineContent & { permissions?: string; user?: string; group?: string }>;
};

export const isInlineConfigTemplate = (configTemplate: ConfigTemplate): configTemplate is InlineConfigTemplate =>
  configTemplate.type === ConfigType.INLINE;

export const isInlineProviderSpec = (providerSpec: ConfigProviderSpec): providerSpec is InlineConfigProviderSpec =>
  'inline' in providerSpec;

export type HttpConfigTemplate = ConfigTemplate & {
  type: ConfigType.HTTP;
  repository: string;
  validationSuffix: string;
  suffix: string;
  filePath: string;
};

export const isHttpConfigTemplate = (configTemplate: ConfigTemplate): configTemplate is HttpConfigTemplate =>
  configTemplate.type === ConfigType.HTTP;

export const isHttpProviderSpec = (providerSpec: ConfigProviderSpec): providerSpec is HttpConfigProviderSpec =>
  'httpRef' in providerSpec;

export type SpecConfigTemplate = GitConfigTemplate | HttpConfigTemplate | KubeSecretTemplate | InlineConfigTemplate;
export type SystemdUnitFormValue = {
  pattern: string;
  exists: boolean;
};

export type DeviceSpecConfigFormValues = {
  osImage?: string;
  configTemplates: SpecConfigTemplate[];
  applications: AppForm[];
  systemdUnits: SystemdUnitFormValue[];
  updatePolicy: UpdatePolicyForm;
  registerMicroShift: boolean;
  useBasicUpdateConfig: boolean;
};

export type EditDeviceFormValues = DeviceSpecConfigFormValues & {
  deviceAlias: string;
  labels: FlightCtlLabel[];
  fleetMatch: string;
};

export type FleetFormValues = DeviceSpecConfigFormValues & {
  name: string;
  fleetLabels: FlightCtlLabel[];
  labels: FlightCtlLabel[];
  rolloutPolicy: RolloutPolicyForm;
  disruptionBudget: DisruptionBudgetForm;
  updatePolicy: UpdatePolicyForm;
};

export enum BatchLimitType {
  BatchLimitPercent = 'percent',
  BatchLimitAbsoluteNumber = 'value',
}

export type BatchForm = {
  selector: FlightCtlLabel[];
  limit?: number;
  limitType: BatchLimitType;
  successThreshold?: number;
};

export type RolloutPolicyForm = {
  isAdvanced: boolean;
  updateTimeout: number;
  batches: BatchForm[];
};

export type DisruptionBudgetForm = DisruptionBudget & {
  isAdvanced: boolean;
};

export type UpdatePolicyForm = {
  isAdvanced: boolean;
  downloadAndInstallDiffer: boolean;
  downloadStartsAt?: string;
  downloadEndsAt?: string;
  downloadScheduleMode: UpdateScheduleMode;
  downloadWeekDays: boolean[];
  downloadTimeZone: string;
  installStartsAt?: string;
  installEndsAt?: string;
  installScheduleMode: UpdateScheduleMode;
  installWeekDays: boolean[];
  installTimeZone: string;
};
