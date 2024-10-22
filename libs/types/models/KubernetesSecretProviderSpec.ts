/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KubernetesSecretProviderSpec = {
  /**
   * The name of the config provider
   */
  name: string;
  secretRef: {
    name: string;
    namespace: string;
    mountPath: string;
  };
};

