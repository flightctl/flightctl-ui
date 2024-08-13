/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HookActionExecutable = {
  /**
   * The path or name of the executable file to run. This can be the name of a binary located in $PATH, or a full path to the binary.
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

