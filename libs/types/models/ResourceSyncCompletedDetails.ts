/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResourceSyncCompletedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'ResourceSyncCompleted';
  /**
   * Hash of the last commit.
   */
  commitHash: string;
  /**
   * Number of changes introduced by this ResourceSync update.
   */
  changeCount: number;
  /**
   * Number of errors encountered by this ResourceSync update.
   */
  errorCount: number;
};

