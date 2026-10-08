/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OsModeType } from './OsModeType';
/**
 * Capabilities reported by the device agent.
 */
export type DeviceCapabilities = {
  /**
   * Deprecated since v1.4 and will be removed in a future release. Use status.systemInfo.osMode instead. The service reads status.systemInfo.osMode and only falls back to this field for devices reported by older agents that do not populate systemInfo.
   * @deprecated
   */
  osMode?: OsModeType;
};

