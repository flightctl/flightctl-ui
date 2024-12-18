/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentServiceAuth } from './EnrollmentServiceAuth';
import type { EnrollmentServiceService } from './EnrollmentServiceService';
/**
 * EnrollmentService contains information about how to communicate with a Flight Control enrollment service.
 */
export type EnrollmentService = {
  authentication: EnrollmentServiceAuth;
  service: EnrollmentServiceService;
  /**
   * The URL of the UI that the agent uses to print the QR code and link for enrolling the device.
   */
  'enrollment-ui-endpoint': string;
};

