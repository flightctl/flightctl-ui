/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceOSSpec } from './DeviceOSSpec';
export type RenderedDeviceSpec = {
  renderedVersion: string;
  os?: DeviceOSSpec;
  containers?: {
    matchPatterns?: Array<string>;
  };
  config?: string;
  systemd?: {
    matchPatterns?: Array<string>;
  };
};

