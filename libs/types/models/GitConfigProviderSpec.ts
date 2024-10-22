/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GitConfigProviderSpec = {
  /**
   * The name of the config provider
   */
  name: string;
  gitRef: {
    /**
     * The name of the repository resource to use as the sync source
     *
     */
    repository: string;
    targetRevision: string;
    path: string;
    /**
     * Path to config in device
     */
    mountPath?: string;
  };
};

