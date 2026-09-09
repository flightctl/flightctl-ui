/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseImageEntry } from './BaseImageEntry';
import type { OciAuth } from './OciAuth';
/**
 * OCI container registry specification.
 */
export type OciRepoSpec = {
  /**
   * The OCI registry hostname, FQDN, or IP address with optional port (e.g., quay.io, registry.redhat.io, myregistry.com:5000, 192.168.1.1:5000, [::1]:5000).
   */
  registry: string;
  /**
   * URL scheme for connecting to the registry.
   */
  scheme?: OciRepoSpec.scheme;
  /**
   * The repository type discriminator.
   */
  type: 'oci';
  /**
   * Access mode for the registry: "Read" for read-only (pull), "ReadWrite" for read-write (pull and push).
   */
  accessMode?: OciRepoSpec.accessMode;
  ociAuth?: OciAuth;
  /**
   * Base64 encoded root CA.
   */
  'ca.crt'?: string;
  /**
   * Skip remote server verification.
   */
  skipServerVerification?: boolean;
  /**
   * Optional OCI repository path under spec.registry (e.g. my-org/diffs). When set, this object is that repo (`my-registry.com/my-org/diffs`), not only a registry. Mutually exclusive with namespace. ImageBuild destination imageName must equal this value.
   */
  repository?: string;
  /**
   * Optional org/subpath under spec.registry (e.g. my-org). Concrete names are spec.registry/namespace/<name>. Mutually exclusive with repository. Used by delta push (`{registry}/{namespace}/{imageName}`). Invalid on an ImageBuild or ImageExport destination Repository.
   */
  namespace?: string;
  /**
   * When true, generated deltas are pushed to this object (at most one per org). Auth is the existing ociAuth / accessMode. Placement follows repository / namespace / registry-only as above.
   */
  deltaStorageTarget?: boolean;
  /**
   * Curated list of trusted base images available in this registry. When present, the Image Builder source picker surfaces these entries as selectable options.
   */
  baseImages?: Array<BaseImageEntry>;
};
export namespace OciRepoSpec {
  /**
   * URL scheme for connecting to the registry.
   */
  export enum scheme {
    HTTP = 'http',
    HTTPS = 'https',
  }
  /**
   * Access mode for the registry: "Read" for read-only (pull), "ReadWrite" for read-write (pull and push).
   */
  export enum accessMode {
    READ = 'Read',
    READ_WRITE = 'ReadWrite',
  }
}

