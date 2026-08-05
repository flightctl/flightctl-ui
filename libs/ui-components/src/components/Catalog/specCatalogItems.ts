import type { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';

import { type SpecCatalogItemId, resolveCatalogRef } from '../../utils/catalog';

export type ResolvedCatalogItemData = {
  item: CatalogItem;
  version: CatalogItemVersion | undefined;
  channel: string;
  imageUri?: string;
};

/** Resolves a typed spec catalog item id against a fetched catalog-item lookup. */
export const resolveSpecCatalogItem = (
  id: SpecCatalogItemId,
  getItem: (catalog: string, item: string) => CatalogItem | undefined,
): ResolvedCatalogItemData | undefined => {
  const item = getItem(id.ref.catalog, id.ref.item);
  if (!item) {
    return undefined;
  }
  const resolved = resolveCatalogRef(item, id.ref);
  return {
    item,
    version: resolved.version,
    channel: resolved.channel,
    imageUri: resolved.imageUri,
  };
};
