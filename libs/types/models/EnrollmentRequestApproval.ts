/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * EnrollmentRequestApproval contains information about the approval of a device enrollment request.
 */
export type EnrollmentRequestApproval = {
  /**
   * A set of labels to apply to the device.
   */
  labels?: Record<string, string>;
  /**
   * Indicates whether the request has been approved.
   */
  approved: boolean;
};

