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
   * Image references this application uses and their known content digests in local storage. image is the ref from the current rendered spec (tag or digest). digest is omitted when the local digest is unknown. When image is already a digest ref, digest matches the ref's digest.
   */
  imageDigests?: Array<ApplicationImageDigest>;
  /**
   * Expected total download size for this application update in IEC units (e.g. "245.3 MiB", "1 GiB"). Computed as the sum of all required image pair sizes (parent + nested + volumes), using delta payload size when available or full image payload size otherwise. Absent when no image download is required or any required image size is unknown.
   */
  size?: string;
};

