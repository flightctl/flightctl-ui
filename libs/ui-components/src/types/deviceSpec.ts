import {
  ApplicationProviderSpec,
  ComposeApplication,
  ConfigProviderSpec,
  ContainerApplication,
  DisruptionBudget,
  GitConfigProviderSpec,
  HelmApplication,
  HttpConfigProviderSpec,
  ImageApplicationProviderSpec,
  ImagePullPolicy,
  InlineApplicationProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
  QuadletApplication,
} from '@flightctl/types';
import { FlightCtlLabel } from './extraTypes';
import { UpdateScheduleMode } from '../utils/time';

export const RUN_AS_DEFAULT_USER = 'flightctl';
export const RUN_AS_ROOT_USER = 'root';

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

/** Used when adding a Compose/Quadlet app to choose image vs inline source. */
export enum AppSpecType {
  OCI_IMAGE = 'image',
  INLINE = 'inline',
}

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

export const isImageVariantApp = (
  app: ApplicationProviderSpec,
): app is ApplicationProviderSpec & ImageApplicationProviderSpec => 'image' in app;
export const isInlineVariantApp = (
  app: ApplicationProviderSpec,
): app is ApplicationProviderSpec & InlineApplicationProviderSpec => 'inline' in app;

export type ApplicationVolumeForm = {
  name: string;
  imageRef: string;
  imagePullPolicy: ImagePullPolicy;
  mountPath: string;
};

export type PortMapping = {
  hostPort: string;
  containerPort: string;
};

export type VariablesForm = { name: string; value: string }[];

export type InlineFileForm = { path: string; content?: string; base64?: boolean };

type InlineOrImageVariantForm = {
  specType: AppSpecType;
  image: string;
  files: InlineFileForm[];
};

export type SingleContainerAppForm = Omit<ContainerApplication, 'ports' | 'resources' | 'envVars' | 'volumes'> & {
  specType: AppSpecType.OCI_IMAGE;
  ports: PortMapping[];
  cpuLimit: string;
  memoryLimit: string;
  variables: VariablesForm;
  volumes: ApplicationVolumeForm[];
};

export type HelmAppForm = Omit<HelmApplication, 'values'> & {
  specType: AppSpecType.OCI_IMAGE;
  valuesYaml?: string;
  valuesFiles: string[];
};

export type QuadletAppForm = Omit<QuadletApplication, 'envVars' | 'volumes' | 'image' | 'inline'> &
  InlineOrImageVariantForm & {
    variables: VariablesForm;
    volumes: ApplicationVolumeForm[];
  };

export type ComposeAppForm = Omit<ComposeApplication, 'envVars' | 'volumes' | 'image' | 'inline'> &
  InlineOrImageVariantForm & {
    variables: VariablesForm;
    volumes: ApplicationVolumeForm[];
  };

export type AppForm = SingleContainerAppForm | HelmAppForm | QuadletAppForm | ComposeAppForm;

const hasTemplateVariables = (str: string) => /{{.+?}}/.test(str);

export const getAppIdentifier = (app: AppForm | ApplicationProviderSpec): string => {
  if (app.name) return app.name;
  if ('image' in app && app.image) return app.image;
  return '';
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
  files: Array<InlineFileForm & { permissions?: string; user?: string; group?: string }>;
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
