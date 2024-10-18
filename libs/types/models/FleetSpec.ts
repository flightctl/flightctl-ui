/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceSpec } from './DeviceSpec';
import type { LabelSelector } from './LabelSelector';
import type { ObjectMeta } from './ObjectMeta';
import type { RolloutPolicy } from './RolloutPolicy';
/**
 * FleetSpec is a description of a fleet's target state.
 */
export type FleetSpec = {
  selector?: LabelSelector;
  rolloutPolicy?: RolloutPolicy;
  template: {
    metadata?: ObjectMeta;
    spec: DeviceSpec;
  };
};

