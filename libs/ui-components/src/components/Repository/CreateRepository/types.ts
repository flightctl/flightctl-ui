export type ResourceSyncFormValue = {
  name: string;
  targetRevision: string;
  path: string;
  exists?: boolean;
};

export type RepositoryFormValues = {
  exists: boolean;
  name: string;
  url: string;
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
  };
  sshConfig?: {
    sshPrivateKey?: string;
    privateKeyPassphrase?: string;
    skipServerVerification?: boolean;
  };
  useResourceSyncs: boolean;
  resourceSyncs: ResourceSyncFormValue[];
};
