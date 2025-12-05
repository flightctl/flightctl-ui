/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * GitHubIntrospectionSpec defines token introspection using GitHub API (POST /applications/{client_id}/token). Uses the OAuth2ProviderSpec clientId and clientSecret for Basic Auth and URL path.
 */
export type GitHubIntrospectionSpec = {
  /**
   * The introspection type.
   */
  type: 'github';
  /**
   * The GitHub API base URL. Defaults to https://api.github.com for GitHub.com, but can be customized for GitHub Enterprise Server.
   */
  url?: string;
};

