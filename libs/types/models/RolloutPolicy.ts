/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DisruptionBudget } from './DisruptionBudget';
import type { Duration } from './Duration';
import type { Percentage } from './Percentage';
import type { RolloutDeviceSelection } from './RolloutDeviceSelection';
/**
 * RolloutPolicy is the rollout policy of the fleet.
 */
export type RolloutPolicy = {
  disruptionBudget?: DisruptionBudget;
  deviceSelection?: RolloutDeviceSelection;
  successThreshold?: Percentage;
  defaultUpdateTimeout?: Duration;
};

