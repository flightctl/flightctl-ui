/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeviceDecommission = {
  /**
   * Specifies the desired decommissioning method of the device.
   */
  decommissionTarget: DeviceDecommission.decommissionTarget;
};
export namespace DeviceDecommission {
  /**
   * Specifies the desired decommissioning method of the device.
   */
  export enum decommissionTarget {
    UNENROLL = 'Unenroll',
    FACTORY_RESET = 'FactoryReset',
  }
}

