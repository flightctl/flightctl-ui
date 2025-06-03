/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatusType } from './ApplicationStatusType';
import type { ApplicationVolumeStatus } from './ApplicationVolumeStatus';
export type DeviceApplicationStatus = {
  /**
   * Human readable name of the application.
   */
  name: string;
  /**
   * The number of containers which are ready in the application.
   */
  ready: string;
  /**
   * Number of restarts observed for the application.
   */
  restarts: number;
  status: ApplicationStatusType;
  /**
   * Status of volumes used by this application.
   */
  volumes?: Array<ApplicationVolumeStatus>;
};

