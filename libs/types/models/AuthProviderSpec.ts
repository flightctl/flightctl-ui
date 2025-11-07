/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AapProviderSpec } from './AapProviderSpec';
import type { K8sProviderSpec } from './K8sProviderSpec';
import type { OAuth2ProviderSpec } from './OAuth2ProviderSpec';
import type { OIDCProviderSpec } from './OIDCProviderSpec';
export type AuthProviderSpec = (OIDCProviderSpec | OAuth2ProviderSpec | AapProviderSpec | K8sProviderSpec);

