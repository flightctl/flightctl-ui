import {
  GenericConfigSpec,
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
} from '@flightctl/types';

export type ConfigTemplate = {
  type: 'git' | 'http' | 'secret' | 'inline';
  name: string;
};

export type GitConfigTemplate = ConfigTemplate & {
  type: 'git';
  repository: string;
  targetRevision: string;
  path: string;
  mountPath?: string;
};

export const isGitConfigTemplate = (configTemplate: ConfigTemplate): configTemplate is GitConfigTemplate =>
  configTemplate.type === 'git';

export const isGitProviderSpec = (providerSpec: GenericConfigSpec): providerSpec is GitConfigProviderSpec =>
  providerSpec.configType === 'GitConfigProviderSpec';

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
    relativePath = config.httpRef.suffix || '';
  } else if (isGitProviderSpec(config) && /github|gitlab/.test(repositoryUrl)) {
    const configPath = config.gitRef.path.replace(/^\//g, ''); // remove the leading slash
    const configParts = configPath.split('/');
    const lastPart = configParts[configParts.length - 1];

    // Extension-less files cannot be identified as such. Github and Gitlab both redirect to the correct URL to show the file contents
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
  type: 'secret';
  secretName: string;
  secretNs: string;
  mountPath: string;
};

export const isKubeSecretTemplate = (configTemplate: ConfigTemplate): configTemplate is KubeSecretTemplate =>
  configTemplate.type === 'secret';

export const isKubeProviderSpec = (providerSpec: GenericConfigSpec): providerSpec is KubernetesSecretProviderSpec =>
  providerSpec.configType === 'KubernetesSecretProviderSpec';

export type InlineConfigTemplate = ConfigTemplate & {
  type: 'inline';
  files: Array<{ path: string; content: string; base64: boolean; permissions?: string; user?: string; group?: string }>;
};

export const isInlineConfigTemplate = (configTemplate: ConfigTemplate): configTemplate is InlineConfigTemplate =>
  configTemplate.type === 'inline';

export const isInlineProviderSpec = (providerSpec: GenericConfigSpec): providerSpec is InlineConfigProviderSpec =>
  providerSpec.configType === 'InlineConfigProviderSpec';

export type HttpConfigTemplate = ConfigTemplate & {
  type: 'http';
  repository: string;
  suffix: string;
  filePath: string;
};

export const isHttpConfigTemplate = (configTemplate: ConfigTemplate): configTemplate is HttpConfigTemplate =>
  configTemplate.type === 'http';

export const isHttpProviderSpec = (providerSpec: GenericConfigSpec): providerSpec is HttpConfigProviderSpec =>
  providerSpec.configType === 'HttpConfigProviderSpec';

export type SpecConfigTemplate = GitConfigTemplate | HttpConfigTemplate | KubeSecretTemplate | InlineConfigTemplate;
