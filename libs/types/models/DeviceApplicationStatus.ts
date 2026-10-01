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
   * Image references this application uses and the registry digest associated with each image. image is the ref from the current rendered spec (tag or digest). For a multi-platform index, digest is the platform-specific manifest selected by the runtime when available; if the runtime exposes only an opaque ID, an immutable image reference's digest may be reported. digest is omitted when no registry digest is known.
   */
  imageDigests?: Array<ApplicationImageDigest>;
  /**
   * Expected total size of control-plane generated delta images for this application update in IEC units (e.g. "245.3 MiB", "1 GiB"). Computed as the sum of generated delta image sizes across the application. Absent when no delta image was generated or any generated delta image size is unknown. Full image sizes are not included.
   */
  deltaSize?: string;
};

