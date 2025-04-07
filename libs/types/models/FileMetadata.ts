/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * File metadata.
 */
export type FileMetadata = {
  /**
   * The file's permission mode. You may specify the more familiar octal with a leading zero (e.g., 0644) or as a decimal without a leading zero (e.g., 420). Setuid/setgid/sticky bits are supported. If not specified, the permission mode for files defaults to 0644.
   */
  mode?: number;
  /**
   * The file's owner, specified either as a name or numeric ID. Defaults to "root".
   */
  user?: string;
  /**
   * The file's group, specified either as a name or numeric ID. Defaults to "root".
   */
  group?: string;
};

