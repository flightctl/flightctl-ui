/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventDetails } from './EventDetails';
import type { EventSource } from './EventSource';
import type { ObjectMeta } from './ObjectMeta';
import type { ObjectReference } from './ObjectReference';
export type Event = {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources.
   */
  apiVersion: string;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ObjectMeta;
  involvedObject: ObjectReference;
  /**
   * A short, machine-readable string that describes the reason for the event.
   */
  reason: Event.reason;
  /**
   * A human-readable description of the status of this operation.
   */
  message: string;
  details?: EventDetails;
  /**
   * The type of the event. One of Normal, Warning.
   */
  type: Event.type;
  source: EventSource;
  /**
   * The name of the user or service that triggered the event. The value will be prefixed by either user: (for human users) or service: (for automated services).
   */
  actor: string;
};
export namespace Event {
  /**
   * A short, machine-readable string that describes the reason for the event.
   */
  export enum reason {
    RESOURCE_CREATED = 'ResourceCreated',
    RESOURCE_CREATION_FAILED = 'ResourceCreationFailed',
    RESOURCE_UPDATED = 'ResourceUpdated',
    RESOURCE_UPDATE_FAILED = 'ResourceUpdateFailed',
    RESOURCE_DELETED = 'ResourceDeleted',
    RESOURCE_DELETION_FAILED = 'ResourceDeletionFailed',
    DEVICE_DECOMMISSIONED = 'DeviceDecommissioned',
    DEVICE_DECOMMISSION_FAILED = 'DeviceDecommissionFailed',
    DEVICE_CPUCRITICAL = 'DeviceCPUCritical',
    DEVICE_CPUWARNING = 'DeviceCPUWarning',
    DEVICE_CPUNORMAL = 'DeviceCPUNormal',
    DEVICE_MEMORY_CRITICAL = 'DeviceMemoryCritical',
    DEVICE_MEMORY_WARNING = 'DeviceMemoryWarning',
    DEVICE_MEMORY_NORMAL = 'DeviceMemoryNormal',
    DEVICE_DISK_CRITICAL = 'DeviceDiskCritical',
    DEVICE_DISK_WARNING = 'DeviceDiskWarning',
    DEVICE_DISK_NORMAL = 'DeviceDiskNormal',
    DEVICE_APPLICATION_ERROR = 'DeviceApplicationError',
    DEVICE_APPLICATION_DEGRADED = 'DeviceApplicationDegraded',
    DEVICE_APPLICATION_HEALTHY = 'DeviceApplicationHealthy',
    DEVICE_DISCONNECTED = 'DeviceDisconnected',
    DEVICE_CONNECTED = 'DeviceConnected',
    DEVICE_CONTENT_UP_TO_DATE = 'DeviceContentUpToDate',
    DEVICE_CONTENT_OUT_OF_DATE = 'DeviceContentOutOfDate',
    DEVICE_CONTENT_UPDATING = 'DeviceContentUpdating',
  }
  /**
   * The type of the event. One of Normal, Warning.
   */
  export enum type {
    NORMAL = 'Normal',
    WARNING = 'Warning',
  }
}

