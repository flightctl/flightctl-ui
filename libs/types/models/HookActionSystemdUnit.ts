/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HookActionSystemdUnit = {
  /**
   * The name of the systemd unit on which the specified operations will be performed. This should be the exact name of the unit file, such as example.service. If the name is not populated the name will be auto discovered from the file path.
   */
  name: string;
  /**
   * The specific systemd operations to perform on the specified unit.
   */
  operations: Array<'Enable' | 'Disable' | 'Start' | 'Stop' | 'Restart' | 'Reload' | 'DaemonReload'>;
  /**
   * The directory in which the executable will be run from if it is left empty it will run from the users home directory.
   */
  workDir?: string;
};

