/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
/**
 * CatalogItemDeployment represents a specific deployment of a catalog item to a fleet or device. A catalog item associated to a fleet that has no devices is still considered a deployment. A deployment is only associated with the fleet and not the individual devices in cases where a device is using a catalog item deployment that came from a device spec template on a fleet.
 */
export type CatalogItemDeployment = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  /**
   * The device or fleet that this deployment pertains to.
   */
  deployedTo?: {
    /**
     * Either a Device or Fleet.
     */
    resourceKind?: string;
    /**
     * The name of the device or fleet.
     */
    resourceName?: string;
  };
  /**
   * The catalog of the catalogItem.
   */
  catalog: string;
  /**
   * The catalogItem that this deployment corresponds to.
   */
  catalogItem: string;
  /**
   * The version of the catalog item that is deployed.
   */
  version: string;
  /**
   * The channel, if any, that is intended to be tracked for the catalog item.
   */
  channel?: string;
  /**
   * For catalog items in the 'application' category, the name of the application on the device that the deployment is associated with. Required for application catalog items.
   */
  applicationName?: string;
};

