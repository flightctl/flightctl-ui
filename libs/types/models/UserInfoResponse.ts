/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Organization } from './Organization';
/**
 * OIDC UserInfo response
 */
export type UserInfoResponse = {
  /**
   * Subject identifier.
   */
  sub?: string;
  /**
   * Preferred username.
   */
  preferred_username?: string;
  /**
   * Full name.
   */
  name?: string;
  /**
   * User organizations.
   */
  organizations?: Array<Organization>;
  /**
   * Error code.
   */
  error?: string;
};

