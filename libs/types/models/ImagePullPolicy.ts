/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Optional. Defaults to 'IfNotPresent'. When set to 'Always', the image is pulled every time. When set to 'Never', the image must already exist on the device.
 */
export enum ImagePullPolicy {
  PullAlways = 'Always',
  PullIfNotPresent = 'IfNotPresent',
  PullNever = 'Never',
}
