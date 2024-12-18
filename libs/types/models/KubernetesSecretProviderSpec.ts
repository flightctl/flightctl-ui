/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KubernetesSecretProviderSpec = {
  /**
   * The name of the config provider.
   */
  name: string;
  /**
   * The reference to a Kubernetes secret.
   */
  secretRef: {
    /**
     * The name of the secret.
     */
    name: string;
    /**
     * The namespace of the secret.
     */
    namespace: string;
    /**
     * Path in the device's file system at which the secret should be mounted.
     */
    mountPath: string;
  };
};

