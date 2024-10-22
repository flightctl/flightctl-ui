/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HttpConfigProviderSpec = {
  /**
   * The name of the config provider
   */
  name: string;
  httpRef: {
    /**
     * The name of the repository resource to use as the sync source
     *
     */
    repository: string;
    /**
     * Part of the URL that comes after the base URL. It can include query parameters such as:
     * /path/to/endpoint?query=param
     *
     */
    suffix?: string;
    /**
     * The path of the file where the response is stored in the filesystem of the device.
     *
     */
    filePath: string;
  };
};

