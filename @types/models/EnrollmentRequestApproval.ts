/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EnrollmentRequestApproval = {
  /**
   * labels is a set of labels to apply to the device.
   */
  labels?: Record<string, string>;
  /**
   * region is the region in which the device should be enrolled.
   */
  region?: string;
  /**
   * approved indicates whether the request has been approved.
   */
  approved: boolean;
  /**
   * approvedBy is the name of the approver.
   */
  approvedBy?: string;
  /**
   * approvedAt is the time at which the request was approved.
   */
  approvedAt?: string;
};

