/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ApplicationLifecycleChangedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'ApplicationLifecycleChanged';
  /**
   * The name of the application whose device-level lifecycle override changed.
   */
  appName: string;
  /**
   * The lifecycle action that was requested.
   */
  action: ApplicationLifecycleChangedDetails.action;
};
export namespace ApplicationLifecycleChangedDetails {
  /**
   * The lifecycle action that was requested.
   */
  export enum action {
    ApplicationLifecycleActionStop = 'stop',
    ApplicationLifecycleActionStart = 'start',
    ApplicationLifecycleActionRestart = 'restart',
  }
}

