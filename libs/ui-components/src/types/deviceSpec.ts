import {
  GenericConfigSpec,
  GitConfigProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
} from '@flightctl/types';

export type ConfigTemplate = {
  type: 'git' | 'secret' | 'inline';
  name: string;
};

export type GitConfigTemplate = ConfigTemplate & {
  type: 'git';
  repository: string;
  targetRevision: string;
  path: string;
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

export type SpecConfigTemplate = GitConfigTemplate | KubeSecretTemplate | InlineConfigTemplate;
