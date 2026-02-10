/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { DeviceSpec } from './DeviceSpec';
import type { DeviceStatus } from './DeviceStatus';
import type { ObjectMeta } from './ObjectMeta';
/**
 * Device represents a physical device.
 */
export type Device = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ObjectMeta;
  spec?: DeviceSpec;
  status?: DeviceStatus;
};

