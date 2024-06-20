/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceApplicationStatusType } from './DeviceApplicationStatusType';
export type DeviceApplicationStatus = {
  /**
   * Unique identifier for the application.
   */
  id: string;
  /**
   * Human readable name of the application.
   */
  name: string;
  /**
   * Status of the application.
   */
  status: DeviceApplicationStatusType;
  /**
   * The number of containers which are ready in the application.
   */
  ready?: string;
  /**
   * Number of restarts observed for the application.
   */
  restarts?: number;
};

