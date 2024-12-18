/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HttpConfigProviderSpec = {
  /**
   * The name of the config provider.
   */
  name: string;
  /**
   * The reference to an HTTP configuration server.
   */
  httpRef: {
    /**
     * The name of the repository resource to use as the sync source.
     */
    repository: string;
    /**
     * Part of the URL that comes after the base URL. It can include query parameters such as: "/path/to/endpoint?query=param".
     */
    suffix?: string;
    /**
     * Path in the device's file system to which the content returned by the HTTP sever should be written.
     */
    filePath: string;
  };
};

