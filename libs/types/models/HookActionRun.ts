/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HookActionRun = {
  /**
   * The command to be executed, including any arguments using standard shell syntax. This field supports multiple commands piped together, as if they were executed under a bash -c context.
   */
  run: string;
  /**
   * Environment variable key-value pairs, injected during runtime.
   */
  envVars?: Record<string, string>;
  /**
   * The working directory to be used when running the command.
   */
  workDir?: string;
};

