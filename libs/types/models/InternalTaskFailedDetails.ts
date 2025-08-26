/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Event } from './Event';
export type InternalTaskFailedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'InternalTaskFailed';
  /**
   * The error message describing the failure.
   */
  errorMessage: string;
  /**
   * Number of times the task has been retried.
   */
  retryCount?: number;
  originalEvent: Event;
};

