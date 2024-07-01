/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceSpec } from './DeviceSpec';
export type TemplateVersionStatus = (DeviceSpec & {
  updatedAt?: string;
  /**
   * Current state of the device.
   */
  conditions: Array<Condition>;
});

