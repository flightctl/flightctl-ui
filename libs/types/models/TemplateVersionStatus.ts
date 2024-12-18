/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceSpec } from './DeviceSpec';
/**
 * TemplateVersionStatus represents information about the status of a template version.
 */
export type TemplateVersionStatus = (DeviceSpec & {
  /**
   * The time at which the template was last updated.
   */
  updatedAt?: string;
  /**
   * Current state of the device.
   */
  conditions: Array<Condition>;
});

