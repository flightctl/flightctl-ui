/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationStatusType } from './ApplicationStatusType';
import type { ApplicationVolumeStatus } from './ApplicationVolumeStatus';
import type { AppType } from './AppType';
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
   * Whether the application is embedded in the bootc image.
   */
  embedded: boolean;
  appType: AppType;
  /**
   * The username of the system user this application is runing under. If blank, the application is run as the same user as the agent (generally root).
   */
  runAs?: string;
  /**
   * Status of volumes used by this application.
   */
  volumes?: Array<ApplicationVolumeStatus>;
};

