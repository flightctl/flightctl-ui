/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DevicesSummary } from './DevicesSummary';
import type { FleetRolloutStatus } from './FleetRolloutStatus';
/**
 * FleetStatus represents information about the status of a fleet. Status may trail the actual state of a fleet, especially if devices of a fleet have not contacted the management service in a while.
 */
export type FleetStatus = {
  rollout?: FleetRolloutStatus;
  /**
   * Current state of the fleet.
   */
  conditions: Array<Condition>;
  devicesSummary?: DevicesSummary;
};

