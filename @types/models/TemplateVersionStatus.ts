/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { GitConfigProviderSpec } from './GitConfigProviderSpec';
import type { InlineConfigProviderSpec } from './InlineConfigProviderSpec';
import type { KubernetesSecretProviderSpec } from './KubernetesSecretProviderSpec';
/**
 * TemplateVersionStatus represents information about the status of a template version.
 */
export type TemplateVersionStatus = {
  os?: DeviceOSSpec;
  /**
   * List of config resources.
   */
  config?: Array<(GitConfigProviderSpec | KubernetesSecretProviderSpec | InlineConfigProviderSpec)>;
  updatedAt?: string;
  /**
   * Current state of the device.
   */
  conditions?: Array<Condition>;
};

