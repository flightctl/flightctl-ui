/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FleetCondition } from './FleetCondition';
/**
 * FleetStatus represents information about the status of a fleet. Status may trail the actual state of a fleet, especially if devices of a fleet have not contacted the management service in a while.
 */
export type FleetStatus = {
  /**
   * Current state of the fleet.
   */
  conditions?: Array<FleetCondition>;
};

