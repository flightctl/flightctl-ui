/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationProviderBase } from './ApplicationProviderBase';
import type { ImageApplicationProviderSpec } from './ImageApplicationProviderSpec';
import type { InlineApplicationProviderSpec } from './InlineApplicationProviderSpec';
/**
 * A VM workload managed by the FlightCtl agent. The VM definition may be delivered either as an OCI image/artifact or as inline application content. For inline providers, the package must contain a KubeVirt VirtualMachine YAML file named vm.yaml.
 */
export type VmApplication = (ApplicationProviderBase & {
  /**
   * List of host-to-guest port mappings for the VM. Each entry must follow the format "hostPort:guestPort" or "hostPort:guestPort/protocol" (e.g. "8080:80" or "8080:80/tcp").
   */
  publishPorts?: Array<string>;
} & (ImageApplicationProviderSpec | InlineApplicationProviderSpec));

