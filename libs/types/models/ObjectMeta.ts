/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.
 */
export type ObjectMeta = {
  creationTimestamp?: string;
  deletionTimestamp?: string;
  /**
   * name of the object
   */
  name?: string;
  /**
   * Map of string keys and values that can be used to organize and categorize (scope and select) objects.
   */
  labels?: Record<string, string>;
  /**
   * A sequence number representing a specific generation of the desired state. Populated by the system. Read-only.
   */
  generation?: number;
  /**
   * A resource that owns this resource, in "kind/name" format.
   */
  owner?: string;
  /**
   * Properties set by the service.
   */
  annotations?: Record<string, string>;
  /**
   * An opaque string that identifies the server's internal version of an object.
   */
  resourceVersion?: string;
};

