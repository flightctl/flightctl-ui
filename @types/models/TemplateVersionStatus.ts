/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceSpecification } from './DeviceSpecification';
export type TemplateVersionStatus = (DeviceSpecification & {
  updatedAt?: string;
  /**
   * Current state of the device.
   */
  conditions?: Array<Condition>;
});

