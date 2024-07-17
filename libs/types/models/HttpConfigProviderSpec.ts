/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenericConfigSpec } from './GenericConfigSpec';
export type HttpConfigProviderSpec = (GenericConfigSpec & {
  httpRef: {
    /**
     * The name of the repository resource to use as the sync source
     *
     */
    repository: string;
    /**
     * The endpoint to fetch the config from
     *
     */
    suffix?: string;
    /**
     * The path to the file to land the body of the response
     *
     */
    filePath: string;
  };
});

