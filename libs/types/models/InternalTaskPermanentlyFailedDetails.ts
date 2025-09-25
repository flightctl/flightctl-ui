/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Event } from './Event';
export type InternalTaskPermanentlyFailedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'InternalTaskPermanentlyFailed';
  /**
   * The error message describing the permanent failure.
   */
  errorMessage: string;
  /**
   * Number of times the task was retried before being marked as permanently failed.
   */
  retryCount: number;
  originalEvent: Event;
};

