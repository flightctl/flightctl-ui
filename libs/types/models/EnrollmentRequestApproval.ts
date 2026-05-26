/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * EnrollmentRequestApproval contains information about the approval of a device enrollment request.
 */
export type EnrollmentRequestApproval = {
  /**
   * Labels to set on the device. If replaceLabels is false (default), labels are merged with agent-provided labels from the enrollment request. If replaceLabels is true, labels are used as the complete final set ignoring agent-provided labels.
   */
  labels?: Record<string, string>;
  /**
   * Controls whether labels are merged or replaced during approval. If false (default), labels are merged with agent-provided labels from the enrollment request. If true, labels are used as the complete final set and agent-provided labels are ignored.
   */
  replaceLabels?: boolean;
  /**
   * Indicates whether the request has been approved.
   */
  approved: boolean;
};

