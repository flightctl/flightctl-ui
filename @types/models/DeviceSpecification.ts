/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { GitConfigProviderSpec } from './GitConfigProviderSpec';
import type { InlineConfigProviderSpec } from './InlineConfigProviderSpec';
import type { KubernetesSecretProviderSpec } from './KubernetesSecretProviderSpec';
export type DeviceSpecification = {
  os?: DeviceOSSpec;
  /**
   * List of config resources.
   */
  config?: Array<(GitConfigProviderSpec | KubernetesSecretProviderSpec | InlineConfigProviderSpec)>;
  containers?: {
    matchPattern?: Array<string>;
  };
  systemd?: {
    matchPatterns?: Array<string>;
  };
};

