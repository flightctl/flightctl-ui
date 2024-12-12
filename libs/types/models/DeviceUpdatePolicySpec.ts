/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateSchedule } from './UpdateSchedule';
/**
 * Specifies the policy for managing device updates, including when updates should be downloaded and applied.
 */
export type DeviceUpdatePolicySpec = {
  /**
   * Defines the schedule for downloading updates.
   */
  downloadSchedule?: UpdateSchedule;
  /**
   * Defines the schedule for applying updates.
   */
  updateSchedule?: UpdateSchedule;
};

