/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HookActionExecutable = {
  /**
   * The command to be executed, including any arguments using standard shell syntax. This field supports multiple commands piped together, as if they were executed under a bash -c context.
   */
  run: string;
  /**
   * An optional list of KEY=VALUE pairs to set as environment variables for the executable.
   */
  envVars?: Array<string>;
  /**
   * The directory in which the executable will be run from if it is left empty it will run from the users home directory.
   */
  workDir?: string;
};

