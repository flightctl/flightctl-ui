/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FileSpec = {
  /**
   * The absolute path to the file on the device. Note that any existing file will be overwritten.
   */
  path: string;
  /**
   * The plain text (UTF-8) or base64-encoded content of the file.
   */
  content: string;
  /**
   * How the contents are encoded. Must be either "plain" or "base64". Defaults to "plain".
   */
  contentEncoding?: FileSpec.contentEncoding;
  /**
   * The file’s permission mode. You may specify the more familiar octal with a leading zero (e.g., 0644) or as
   * a decimal without a leading zero (e.g., 420). Setuid/setgid/sticky bits are supported. If not specified,
   * the permission mode for files defaults to 0644.
   *
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
export namespace FileSpec {
  /**
   * How the contents are encoded. Must be either "plain" or "base64". Defaults to "plain".
   */
  export enum contentEncoding {
    PLAIN = 'plain',
    BASE64 = 'base64',
  }
}

