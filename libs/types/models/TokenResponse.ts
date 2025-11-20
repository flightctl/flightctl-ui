/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * OAuth2 token response
 */
export type TokenResponse = {
  /**
   * OAuth2 access token.
   */
  access_token?: string;
  /**
   * Token type.
   */
  token_type?: TokenResponse.token_type;
  /**
   * OIDC ID token (JWT). Present when using OIDC with openid scope.
   */
  id_token?: string;
  /**
   * OAuth2 refresh token.
   */
  refresh_token?: string;
  /**
   * Token expiration time in seconds.
   */
  expires_in?: number;
  /**
   * OAuth2 error code.
   */
  error?: string;
  /**
   * OAuth2 error description.
   */
  error_description?: string;
};
export namespace TokenResponse {
  /**
   * Token type.
   */
  export enum token_type {
    BEARER = 'Bearer',
  }
}

