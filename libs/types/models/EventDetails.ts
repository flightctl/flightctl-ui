/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceMultipleOwnersDetectedDetails } from './DeviceMultipleOwnersDetectedDetails';
import type { DeviceMultipleOwnersResolvedDetails } from './DeviceMultipleOwnersResolvedDetails';
import type { DeviceOwnershipChangedDetails } from './DeviceOwnershipChangedDetails';
import type { FleetRolloutBatchCompletedDetails } from './FleetRolloutBatchCompletedDetails';
import type { FleetRolloutBatchDispatchedDetails } from './FleetRolloutBatchDispatchedDetails';
import type { FleetRolloutCompletedDetails } from './FleetRolloutCompletedDetails';
import type { FleetRolloutDeviceSelectedDetails } from './FleetRolloutDeviceSelectedDetails';
import type { FleetRolloutFailedDetails } from './FleetRolloutFailedDetails';
import type { FleetRolloutStartedDetails } from './FleetRolloutStartedDetails';
import type { InternalTaskFailedDetails } from './InternalTaskFailedDetails';
import type { ReferencedRepositoryUpdatedDetails } from './ReferencedRepositoryUpdatedDetails';
import type { ResourceSyncCompletedDetails } from './ResourceSyncCompletedDetails';
import type { ResourceUpdatedDetails } from './ResourceUpdatedDetails';
/**
 * Event-specific details, structured based on event type.
 */
export type EventDetails = (ResourceUpdatedDetails | DeviceOwnershipChangedDetails | DeviceMultipleOwnersDetectedDetails | DeviceMultipleOwnersResolvedDetails | InternalTaskFailedDetails | ResourceSyncCompletedDetails | ReferencedRepositoryUpdatedDetails | FleetRolloutStartedDetails | FleetRolloutFailedDetails | FleetRolloutCompletedDetails | FleetRolloutBatchDispatchedDetails | FleetRolloutBatchCompletedDetails | FleetRolloutDeviceSelectedDetails);

