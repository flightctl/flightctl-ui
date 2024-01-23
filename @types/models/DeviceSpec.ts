/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { GitConfigProviderSpec } from './GitConfigProviderSpec';
import type { InlineConfigProviderSpec } from './InlineConfigProviderSpec';
import type { KubernetesSecretProviderSpec } from './KubernetesSecretProviderSpec';
/**
 * DeviceSpec is a description of a device's target state.
 */
export type DeviceSpec = {
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

