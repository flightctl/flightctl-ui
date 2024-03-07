/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenericConfigSpec } from './GenericConfigSpec';
export type GitConfigProviderSpec = (GenericConfigSpec & {
  gitRef: {
    /**
     * The name of the repository resource to use as the sync source
     *
     */
    repository: string;
    targetRevision: string;
    path: string;
  };
});

