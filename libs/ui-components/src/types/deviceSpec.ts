import {
  AppType,
  ApplicationResourceLimits,
  ConfigProviderSpec,
  DisruptionBudget,
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  ImageApplicationProviderSpec,
  ImagePullPolicy,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
} from '@flightctl/types';
import { ApplicationProviderSpecFixed, FlightCtlLabel } from './extraTypes';
import { UpdateScheduleMode } from '../utils/time';

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
  appType: AppType;
  specType: AppSpecType;
  name?: string;
  variables: { name: string; value: string }[];
  volumes?: ApplicationVolumeForm[];
};

export type PortMapping = {
  hostPort: string;
  containerPort: string;
};

export type SingleContainerAppForm = AppBase & {
  appType: AppType.AppTypeContainer;
  specType: AppSpecType.OCI_IMAGE;
  name: string;
  image: string;
  ports?: PortMapping[];
  limits?: ApplicationResourceLimits;
};

export type QuadletImageAppForm = AppBase & {
  appType: AppType.AppTypeQuadlet;
  specType: AppSpecType.OCI_IMAGE;
  image: string;
};

export type QuadletInlineAppForm = AppBase & {
  appType: AppType.AppTypeQuadlet;
  specType: AppSpecType.INLINE;
  name: string; // transforms the field in required
  files: InlineContent[];
};

export type ComposeImageAppForm = AppBase & {
  appType: AppType.AppTypeCompose;
  specType: AppSpecType.OCI_IMAGE;
  image: string;
};

export type ComposeInlineAppForm = AppBase & {
  appType: AppType.AppTypeCompose;
  specType: AppSpecType.INLINE;
  name: string;
  files: InlineContent[];
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

export type AppForm =
  | QuadletImageAppForm
  | QuadletInlineAppForm
  | ComposeImageAppForm
  | ComposeInlineAppForm
  | SingleContainerAppForm;

export const isImageAppProvider = (
  app: ApplicationProviderSpecFixed,
): app is ApplicationProviderSpecFixed & ImageApplicationProviderSpec => 'image' in app;

// Type guards for the 5 explicit types
export const isQuadletImageAppForm = (app: AppBase): app is QuadletImageAppForm =>
  app.appType === AppType.AppTypeQuadlet && app.specType === AppSpecType.OCI_IMAGE;
export const isQuadletInlineAppForm = (app: AppBase): app is QuadletInlineAppForm =>
  app.appType === AppType.AppTypeQuadlet && app.specType === AppSpecType.INLINE;
export const isComposeImageAppForm = (app: AppBase): app is ComposeImageAppForm =>
  app.appType === AppType.AppTypeCompose && app.specType === AppSpecType.OCI_IMAGE;
export const isComposeInlineAppForm = (app: AppBase): app is ComposeInlineAppForm =>
  app.appType === AppType.AppTypeCompose && app.specType === AppSpecType.INLINE;
export const isSingleContainerAppForm = (app: AppBase): app is SingleContainerAppForm =>
  app.appType === AppType.AppTypeContainer;

export type ApplicationVolumeForm = {
  name: string;
  imageRef?: string;
  imagePullPolicy?: ImagePullPolicy;
  mountPath?: string;
};

const hasTemplateVariables = (str: string) => /{{.+?}}/.test(str);

export const getAppIdentifier = (app: AppForm) => {
  if (isSingleContainerAppForm(app)) {
    return app.name || app.image;
  }
  if (isQuadletImageAppForm(app) || isComposeImageAppForm(app)) {
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
  downloadStartGraceDuration?: string;
  downloadScheduleMode: UpdateScheduleMode;
  downloadWeekDays: boolean[];
  downloadTimeZone: string;
  installStartsAt?: string;
  installEndsAt?: string;
  installStartGraceDuration?: string;
  installScheduleMode: UpdateScheduleMode;
  installWeekDays: boolean[];
  installTimeZone: string;
};
