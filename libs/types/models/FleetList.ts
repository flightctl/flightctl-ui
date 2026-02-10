/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { Fleet } from './Fleet';
import type { ListMeta } from './ListMeta';
/**
 * FleetList is a list of Fleets.
 */
export type FleetList = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ListMeta;
  /**
   * List of Fleets.
   */
  items: Array<Fleet>;
};

