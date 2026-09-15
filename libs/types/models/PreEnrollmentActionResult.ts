/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Result of a single executed pre-enrollment hook action, agent-populated.
 */
export type PreEnrollmentActionResult = {
  /**
   * Path to the hook definition YAML that contained this action (for example /etc/flightctl/hooks.d/beforeenrolling/10-network.yaml).
   */
  source: string;
  /**
   * Process exit code from the hook action.
   */
  exitCode: number;
  /**
   * Redacted stdout/stderr from this action. The total size across all actions is capped at 4KiB. Secret patterns (PEM blocks, Bearer prefixes, known token env names) are redacted before persistence.
   */
  output?: string;
};

