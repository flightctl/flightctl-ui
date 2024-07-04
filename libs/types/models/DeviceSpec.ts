/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CPUResourceMonitorSpec } from './CPUResourceMonitorSpec';
import type { CustomResourceMonitorSpec } from './CustomResourceMonitorSpec';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { DiskResourceMonitorSpec } from './DiskResourceMonitorSpec';
import type { GitConfigProviderSpec } from './GitConfigProviderSpec';
import type { InlineConfigProviderSpec } from './InlineConfigProviderSpec';
import type { KubernetesSecretProviderSpec } from './KubernetesSecretProviderSpec';
import type { MemoryResourceMonitorSpec } from './MemoryResourceMonitorSpec';
export type DeviceSpec = {
  os?: DeviceOSSpec;
  /**
   * List of config resources.
   */
  config?: Array<(GitConfigProviderSpec | KubernetesSecretProviderSpec | InlineConfigProviderSpec)>;
  containers?: {
    matchPatterns?: Array<string>;
  };
  systemd?: {
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<(CPUResourceMonitorSpec | MemoryResourceMonitorSpec | DiskResourceMonitorSpec | CustomResourceMonitorSpec)>;
};

