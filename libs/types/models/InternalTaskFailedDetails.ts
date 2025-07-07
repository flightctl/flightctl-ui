/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InternalTaskFailedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'InternalTaskFailed';
  /**
   * The type of internal task that failed.
   */
  taskType: string;
  /**
   * The error message describing the failure.
   */
  errorMessage: string;
  /**
   * Number of times the task has been retried.
   */
  retryCount?: number;
  /**
   * Parameters needed to retry the task.
   */
  taskParameters?: Record<string, string>;
};

