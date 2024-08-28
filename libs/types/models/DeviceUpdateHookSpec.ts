/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FileOperation } from './FileOperation';
import type { HookAction } from './HookAction';
export type DeviceUpdateHookSpec = {
  name?: string;
  description?: string;
  /**
   * The actions to take when the specified file operations are observed. Each action is executed in the order they are defined.
   */
  actions: Array<HookAction>;
  onFile?: Array<FileOperation>;
  /**
   * The path to monitor for changes in configuration files. This path can point to either a specific file or an entire directory.
   */
  path?: string;
};

