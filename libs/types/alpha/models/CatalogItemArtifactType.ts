/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Artifact format discriminator. Must be unique within the artifacts list. Includes bootc-image-builder output formats.
 */
export enum CatalogItemArtifactType {
  CatalogItemArtifactTypeContainer = 'container',
  CatalogItemArtifactTypeQcow2 = 'qcow2',
  CatalogItemArtifactTypeAmi = 'ami',
  CatalogItemArtifactTypeIso = 'iso',
  CatalogItemArtifactTypeAnacondaIso = 'anaconda-iso',
  CatalogItemArtifactTypeVmdk = 'vmdk',
  CatalogItemArtifactTypeVhd = 'vhd',
  CatalogItemArtifactTypeRaw = 'raw',
  CatalogItemArtifactTypeGce = 'gce',
}
