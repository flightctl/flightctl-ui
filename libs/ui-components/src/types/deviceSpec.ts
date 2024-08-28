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
  inline: string;
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
