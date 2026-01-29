/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ApplicationUser = {
  /**
   * The username of the system user this application should be run under. This is not the same as the user within any containers of the application (if applicable). Defaults to the user that the agent runs as (generally root) if not specified.
   */
  runAs?: string;
};

