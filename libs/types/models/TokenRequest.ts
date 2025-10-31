/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * OAuth2 token request
 */
export type TokenRequest = {
  /**
   * OAuth2 grant type.
   */
  grant_type: TokenRequest.grant_type;
  /**
   * OAuth2 client identifier.
   */
  client_id: string;
  /**
   * Refresh token for refresh_token grant.
   */
  refresh_token?: string | null;
  /**
   * Authorization code for authorization_code grant.
   */
  code?: string | null;
  /**
   * OAuth2 scope.
   */
  scope?: string | null;
  /**
   * PKCE code verifier.
   */
  code_verifier?: string | null;
  /**
   * OAuth2 redirect URI (required for authorization_code grant if included in authorization request).
   */
  redirect_uri?: string | null;
};
export namespace TokenRequest {
  /**
   * OAuth2 grant type.
   */
  export enum grant_type {
    REFRESH_TOKEN = 'refresh_token',
    AUTHORIZATION_CODE = 'authorization_code',
  }
}

