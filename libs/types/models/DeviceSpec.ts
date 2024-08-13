/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceHooksSpec } from './DeviceHooksSpec';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { GitConfigProviderSpec } from './GitConfigProviderSpec';
import type { HttpConfigProviderSpec } from './HttpConfigProviderSpec';
import type { InlineConfigProviderSpec } from './InlineConfigProviderSpec';
import type { KubernetesSecretProviderSpec } from './KubernetesSecretProviderSpec';
import type { ResourceMonitor } from './ResourceMonitor';
export type DeviceSpec = {
  os?: DeviceOSSpec;
  /**
   * List of config resources.
   */
  config?: Array<(GitConfigProviderSpec | KubernetesSecretProviderSpec | InlineConfigProviderSpec | HttpConfigProviderSpec)>;
  hooks?: DeviceHooksSpec;
  containers?: {
    matchPatterns?: Array<string>;
  };
  systemd?: {
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<ResourceMonitor>;
};

