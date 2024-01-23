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
};

