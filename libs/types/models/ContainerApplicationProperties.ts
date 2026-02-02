/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationPort } from './ApplicationPort';
import type { ApplicationResources } from './ApplicationResources';
/**
 * Properties for container application deployments.
 */
export type ContainerApplicationProperties = {
  /**
   * Port mappings.
   */
  ports?: Array<ApplicationPort>;
  resources?: ApplicationResources;
};

