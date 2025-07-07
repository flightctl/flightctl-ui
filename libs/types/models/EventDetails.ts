/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceMultipleOwnersDetectedDetails } from './DeviceMultipleOwnersDetectedDetails';
import type { DeviceMultipleOwnersResolvedDetails } from './DeviceMultipleOwnersResolvedDetails';
import type { DeviceOwnershipChangedDetails } from './DeviceOwnershipChangedDetails';
import type { FleetSelectorProcessingCompletedDetails } from './FleetSelectorProcessingCompletedDetails';
import type { InternalTaskFailedDetails } from './InternalTaskFailedDetails';
import type { ResourceUpdatedDetails } from './ResourceUpdatedDetails';
/**
 * Event-specific details, structured based on event type.
 */
export type EventDetails = (ResourceUpdatedDetails | DeviceOwnershipChangedDetails | DeviceMultipleOwnersDetectedDetails | DeviceMultipleOwnersResolvedDetails | InternalTaskFailedDetails | FleetSelectorProcessingCompletedDetails);

