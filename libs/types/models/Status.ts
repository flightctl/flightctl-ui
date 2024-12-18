/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Status is a return value for calls that don't return other objects.
 */
export type Status = {
  /**
   * A human-readable description of the status of this operation.
   */
  message?: string;
  /**
   * A machine-readable description of why this operation is in the "Failure" status. If this value is empty there is no information available. A Reason clarifies an HTTP status code but does not override it.
   */
  reason?: string;
  /**
   * Status of the operation. One of: "Success" or "Failure". More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status.
   */
  status?: string;
};

