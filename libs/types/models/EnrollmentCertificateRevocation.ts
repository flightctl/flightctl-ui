/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Immutable server-owned enrollment credential revocation state.
 */
export type EnrollmentCertificateRevocation = {
  /**
   * The time at which the enrollment credential was revoked.
   */
  revokedAt: string;
  /**
   * The authenticated actor that revoked the enrollment credential.
   */
  revokedBy: string;
  /**
   * The security reason supplied by the authenticated actor.
   */
  reason: string;
  /**
   * The time at which affected-device flagging completed.
   */
  flaggingCompletedAt?: string;
};

