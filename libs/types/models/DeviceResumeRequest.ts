/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to resume devices based on label selector and/or field selector. At least one selector must be provided.
 */
export type DeviceResumeRequest = {
  /**
   * A selector to restrict the list of devices to resume by their labels. Uses the same format as Kubernetes label selectors (e.g., "key1=value1,key2!=value2").
   */
  labelSelector?: string;
  /**
   * A selector to restrict the list of devices to resume by their fields. Uses the same format as Kubernetes field selectors (e.g., "metadata.name=device1,status.phase!=Pending").
   */
  fieldSelector?: string;
};

