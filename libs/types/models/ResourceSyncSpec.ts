/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResourceSyncSpec = {
  /**
   * The name of the repository resource to use as the sync source
   *
   */
  repository: string;
  /**
   * The desired revision in the repository
   */
  targetRevision: string;
  /**
   * The path of a file or directory in the repository. If a directory,
   * the directory should contain only resource definitions with no
   * subdirectories. Each file should contain the definition of one or
   * more resources.
   *
   */
  path: string;
};

