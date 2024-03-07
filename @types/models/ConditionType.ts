/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export enum ConditionType {
  EnrollmentRequestApproved = 'Approved',
  RepositoryAccessible = 'Accessible',
  ResourceSyncAccessible = 'ResourceParsed',
  ResourceSyncResourceParsed = 'Synced',
  ResourceSyncSynced = 'OverlappingSelectors',
  FleetOverlappingSelectors = 'Ready',
  DeviceReady = 'DiskPressure',
  DeviceDiskPressure = 'MemoryPressure',
  DeviceMemoryPressure = 'PIDPressure',
  DevicePIDPressure = 'CPUPressure',
  DeviceCPUPressure = 'Available',
  DeviceAvailable = 'Progressing',
  DeviceProgressing = 'Degraded',
}
