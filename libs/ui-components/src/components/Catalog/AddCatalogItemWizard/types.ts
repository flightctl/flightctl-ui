import { CatalogItemArtifactType, CatalogItemType } from '@flightctl/types/alpha';

export type CreateCatalogFormValues = {
  name: string;
  displayName: string;
  shortDescription: string;
  icon: string;
  provider: string;
  support: string;
};

export type VersionFormValues = {
  version: string;
  references: Record<string, string>;
  channels: string[];
  replaces: string;
  skips: string;
  skipRange: string;
  readme: string;
  config: string;
  configSchema: string;
  deprecated: boolean;
  deprecationMessage: string;
};

export const configurableAppTypes: CatalogItemType[] = [
  CatalogItemType.CatalogItemTypeContainer,
  CatalogItemType.CatalogItemTypeHelm,
  CatalogItemType.CatalogItemTypeQuadlet,
  CatalogItemType.CatalogItemTypeCompose,
];

export type ArtifactFormValue = {
  type: CatalogItemArtifactType | '';
  name: string;
  uri: string;
};

export type AddCatalogItemFormValues = {
  catalog: string;
  name: string;
  displayName: string;
  shortDescription: string;
  icon: string;
  type: CatalogItemType | '';
  artifacts: ArtifactFormValue[];
  containerUri: string;
  provider: string;
  homepage: string;
  supportUrl: string;
  documentationUrl: string;
  versions: VersionFormValues[];
  defaultConfig: string;
  defaultConfigSchema: string;
  deprecated: boolean;
  deprecationMessage: string;
  deprecationReplacement: string;
};
