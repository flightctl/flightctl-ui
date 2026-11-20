/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Administrative enrollment policy configuration.
 */
export type EnrollmentApprovalPolicySpec = {
  /**
   * Whether this policy participates in automatic approval. Defaults to false.
   */
  enabled?: boolean;
  /**
   * Immutable name of an enrollment credential CSR in this tenant. An enabled policy requires a currently valid, issued, unrevoked credential.
   */
  certificateName: string;
  /**
   * Whether server-verified TPM identity is required. Defaults to false.
   */
  requireTPMVerification?: boolean;
  /**
   * Restricted boolean CEL expression. The server validates it when creating an enabled policy, enabling a policy, or changing the expression of an enabled policy.
   */
  matchExpression: string;
  /**
   * Static labels assigned to automatically approved devices; may be empty.
   */
  deviceLabels: Record<string, string>;
  /**
   * Exact incoming label keys permitted to supplement static device labels.
   */
  allowedIncomingLabels?: Array<string>;
  /**
   * Lifetime automatic approval cap; absent or null is unlimited and zero blocks approvals.
   */
  approvalLimit?: number | null;
  /**
   * Optional issuance-relative window in whole days. An enabled policy with a window requires authoritative credential issuance time.
   */
  autoApprovalWindowDays?: number | null;
};

