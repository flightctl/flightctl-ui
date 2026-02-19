/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Configuration fields that can be specified at item level (as defaults) and overridden at version level. Version-level values fully replace item-level values (not merged).
 */
export type CatalogItemConfigurable = {
  /**
   * Configuration values (envVars, ports, volumes, resources, etc.).
   */
  config?: Record<string, any>;
  /**
   * JSON Schema defining configurable parameters and their validation.
   */
  configSchema?: Record<string, any>;
  /**
   * Detailed documentation, preferably in markdown format.
   */
  readme?: string;
};

