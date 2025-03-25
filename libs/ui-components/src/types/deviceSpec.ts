import {
  ApplicationProviderSpec,
  ConfigProviderSpec,
  DisruptionBudget,
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
} from '@flightctl/types';
import { FlightCtlLabel } from './extraTypes';
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
  mountPath?: string;
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

const hasTemplateVariables = (str: string) => /device.metadata/.test(str);

export const getConfigFullRepoUrl = (config: RepoConfig, repositoryUrl: string) => {
  let relativePath: string = '';
  if (isHttpProviderSpec(config)) {
    relativePath = (config.httpRef.suffix || '').replace(/^\//g, ''); // remove the leading slash
  } else if (isGitProviderSpec(config) && /github|gitlab/.test(repositoryUrl)) {
    const configPath = config.gitRef.path.replace(/^\//g, ''); // remove the leading slash
    const configParts = configPath.split('/');
    const lastPart = configParts[configParts.length - 1];

    // Extension-less files cannot be identified as such. GitHub and Gitlab both redirect to the correct URL to show the file contents
    const fileOrDir = lastPart.includes('.') ? 'blob' : 'tree';
    relativePath = `${fileOrDir}/${config.gitRef.targetRevision}/${configPath}`;
  }

  if (relativePath && !hasTemplateVariables(relativePath)) {
    return `${repositoryUrl}/${relativePath}`;
  }
  // We return just the base repository URL as a fallback
  return repositoryUrl;
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
  files: Array<{ path: string; content: string; base64: boolean; permissions?: string; user?: string; group?: string }>;
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

export type ApplicationFormSpec = Omit<ApplicationProviderSpec, 'envVars'> & {
  variables: { name: string; value: string }[];
};

export type SystemdUnitFormValue = {
  pattern: string;
  exists: boolean;
};

export type DeviceSpecConfigFormValues = {
  osImage?: string;
  configTemplates: SpecConfigTemplate[];
  applications: ApplicationFormSpec[];
  systemdUnits: SystemdUnitFormValue[];
  updatePolicy: UpdatePolicyForm;
  registerMicroShift: boolean;
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
