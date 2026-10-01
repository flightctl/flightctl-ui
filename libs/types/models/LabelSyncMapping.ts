/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { LabelSyncMappingSpec } from './LabelSyncMappingSpec';
import type { LabelSyncMappingStatus } from './LabelSyncMappingStatus';
import type { ObjectMeta } from './ObjectMeta';
/**
 * LabelSyncMapping defines an organization-scoped device label mapping.
 */
export type LabelSyncMapping = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing this resource type.
   */
  kind: LabelSyncMapping.kind;
  metadata: ObjectMeta;
  spec: LabelSyncMappingSpec;
  status?: LabelSyncMappingStatus;
};
export namespace LabelSyncMapping {
  /**
   * Kind is a string value representing this resource type.
   */
  export enum kind {
    LabelSyncMappingKindLabelSyncMapping = 'LabelSyncMapping',
  }
}

