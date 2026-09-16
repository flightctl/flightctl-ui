/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationImageDigest } from './ApplicationImageDigest';
import type { ApplicationStatusType } from './ApplicationStatusType';
import type { ApplicationVolumeStatus } from './ApplicationVolumeStatus';
import type { AppType } from './AppType';
import type { DeviceDeltaApplyStatus } from './DeviceDeltaApplyStatus';
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
  lastDelta?: DeviceDeltaApplyStatus;
  /**
   * Image references this application uses and their digests in local storage. image is the ref from the current rendered spec (tag or digest). digest is what is in storage. When image is already a digest ref it matches digest.
   */
  imageDigests?: Array<ApplicationImageDigest>;
  /**
   * Expected total download size for this application update in IEC units (e.g. "245.3 MiB", "1 GiB"). Computed as the sum of all image pair sizes (parent + nested + volumes), using delta size when available or full manifest size otherwise. Absent when no size information is available.
   */
  size?: string;
};

