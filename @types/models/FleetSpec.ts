/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceSpecification } from './DeviceSpecification';
import type { LabelSelector } from './LabelSelector';
import type { ObjectMeta } from './ObjectMeta';
/**
 * FleetSpec is a description of a fleet's target state.
 */
export type FleetSpec = {
  selector?: LabelSelector;
  template: {
    metadata?: ObjectMeta;
    spec: DeviceSpecification;
  };
};

