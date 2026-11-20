/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareUpdaterSpec selects the approved updater release that applies the firmware, by exact name and version, together with its updater-specific configuration. Executable paths, runtime flags, privileges and trust anchors are not configurable; the approved updater release defines them.
 */
export type FirmwareUpdaterSpec = {
  /**
   * Name of the approved updater. In a fleet template the value may use template parameters.
   */
  name: string;
  /**
   * Exact version of the approved updater release. In a fleet template the value may use template parameters.
   */
  version: string;
  /**
   * Updater-specific configuration, such as resource mappings, candidate firmware releases and their artifact sources. The closed configuration schema of the selected updater release defines every allowed field. In a fleet template, only string fields that the updater release designates as templatable may use template parameters.
   */
  config: Record<string, any>;
};

