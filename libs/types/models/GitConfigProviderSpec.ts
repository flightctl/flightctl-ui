/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GitConfigProviderSpec = {
  /**
   * The name of the config provider.
   */
  name: string;
  /**
   * The reference to a Git configuration server.
   */
  gitRef: {
    /**
     * The name of the Repository resource.
     */
    repository: string;
    /**
     * The revision to use from the Repository.
     */
    targetRevision: string;
    /**
     * The path to the config in the Repository.
     */
    path: string;
  };
};

