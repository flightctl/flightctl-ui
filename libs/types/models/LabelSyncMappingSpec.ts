/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Desired state for a label synchronization mapping.
 */
export type LabelSyncMappingSpec = {
  /**
   * Immutable resource type evaluated by the mapping.
   */
  resourceType: LabelSyncMappingSpec.resourceType;
  /**
   * Complete destination label key for scalar mode. Omitted or null selects map mode; no prefix is added.
   */
  key?: string | null;
  /**
   * CEL expression evaluated for the selected resource type.
   */
  expression: string;
};
export namespace LabelSyncMappingSpec {
  /**
   * Immutable resource type evaluated by the mapping.
   */
  export enum resourceType {
    LabelSyncMappingSpecResourceTypeDevice = 'Device',
  }
}

