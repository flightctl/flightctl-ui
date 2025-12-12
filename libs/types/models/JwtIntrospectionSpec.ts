/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * JwtIntrospectionSpec defines token introspection using JWT validation with JWKS.
 */
export type JwtIntrospectionSpec = {
  /**
   * The introspection type.
   */
  type: 'jwt';
  /**
   * The JWKS (JSON Web Key Set) endpoint URL for fetching public keys to validate JWT signatures.
   */
  jwksUrl: string;
  /**
   * Expected issuer claim value in the JWT. If not specified, uses the OAuth2ProviderSpec issuer.
   */
  issuer?: string;
  /**
   * Expected audience claim values in the JWT. If not specified, uses the OAuth2ProviderSpec clientId.
   */
  audience?: Array<string>;
};

