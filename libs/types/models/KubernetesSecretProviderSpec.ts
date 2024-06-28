/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenericConfigSpec } from './GenericConfigSpec';
export type KubernetesSecretProviderSpec = (GenericConfigSpec & {
  secretRef: {
    name: string;
    namespace: string;
    mountPath: string;
  };
});

