/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HookAction } from './HookAction';
export type DeviceRebootHookSpec = {
  name?: string;
  description?: string;
  /**
   * The actions taken before and after system reboots are observed. Each action is executed in the order they are defined.
   */
  actions: Array<HookAction>;
};

