import { OciRepoSpec, RepoSpecType } from '@flightctl/types';

export type ResourceSyncFormValue = {
  name: string;
  targetRevision: string;
  path: string;
  exists?: boolean;
};

export type RepositoryFormValues = {
  exists: boolean;
  name: string;
  repoType: RepoSpecType;
  url: string;
  validationSuffix?: string;
  allowedRepoTypes?: RepoSpecType[];
  showRepoTypes: boolean;
  useAdvancedConfig: boolean;
  configType: 'http' | 'ssh';
  httpConfig?: {
    basicAuth?: {
      use?: boolean;
      username?: string;
      password?: string;
    };
    mTlsAuth?: {
      use?: boolean;
      tlsCrt?: string;
      tlsKey?: string;
    };
    caCrt?: string;
    skipServerVerification?: boolean;
    token?: string;
  };
  sshConfig?: {
    sshPrivateKey?: string;
    privateKeyPassphrase?: string;
    skipServerVerification?: boolean;
  };
  ociConfig?: {
    registry: string;
    scheme?: OciRepoSpec.scheme;
    accessMode?: OciRepoSpec.accessMode;
    caCrt?: string;
    ociAuth?: {
      use?: boolean;
      username?: string;
      password?: string;
    };
    skipServerVerification?: boolean;
  };
  canUseResourceSyncs: boolean;
  useResourceSyncs: boolean;
  resourceSyncs: ResourceSyncFormValue[];
};
