/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KubernetesSecretProviderSpec = {
  name: string;
  secretRef: {
    name: string;
    namespace: string;
    mountPath: string;
  };
};

