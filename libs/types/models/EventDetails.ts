/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceMultipleOwnersDetectedDetails } from './DeviceMultipleOwnersDetectedDetails';
import type { DeviceMultipleOwnersResolvedDetails } from './DeviceMultipleOwnersResolvedDetails';
import type { DeviceOwnershipChangedDetails } from './DeviceOwnershipChangedDetails';
import type { FleetRolloutStartedDetails } from './FleetRolloutStartedDetails';
import type { InternalTaskFailedDetails } from './InternalTaskFailedDetails';
import type { ResourceSyncCompletedDetails } from './ResourceSyncCompletedDetails';
import type { ResourceUpdatedDetails } from './ResourceUpdatedDetails';
/**
 * Event-specific details, structured based on event type.
 */
export type EventDetails = (ResourceUpdatedDetails | DeviceOwnershipChangedDetails | DeviceMultipleOwnersDetectedDetails | DeviceMultipleOwnersResolvedDetails | InternalTaskFailedDetails | ResourceSyncCompletedDetails | FleetRolloutStartedDetails);

