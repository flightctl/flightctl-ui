/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Type of condition in CamelCase.
 */
export enum ConditionType {
  EnrollmentRequestApproved = 'Approved',
  EnrollmentRequestTPMVerified = 'TPMVerified',
  CertificateSigningRequestApproved = 'Denied',
  CertificateSigningRequestDenied = 'Failed',
  CertificateSigningRequestFailed = 'Accessible',
  CertificateSigningRequestTPMVerified = 'ResourceParsed',
  RepositoryAccessible = 'Synced',
  ResourceSyncAccessible = 'Valid',
  ResourceSyncResourceParsed = 'RolloutInProgress',
  ResourceSyncSynced = 'Updating',
  FleetValid = 'SpecValid',
  FleetRolloutInProgress = 'MultipleOwners',
  DeviceUpdating = 'DeviceDecommissioning',
}
