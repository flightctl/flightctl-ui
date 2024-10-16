/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DisruptionAllowance } from './DisruptionAllowance';
import type { Duration } from './Duration';
import type { Percentage } from './Percentage';
import type { RolloutDeviceSelection } from './RolloutDeviceSelection';
/**
 * RolloutPolicy is the rollout policy of the fleet.
 */
export type RolloutPolicy = {
  disruptionAllowance?: DisruptionAllowance;
  deviceSelection?: RolloutDeviceSelection;
  successThreshold?: Percentage;
  defaultUpdateTimeout?: Duration;
};

