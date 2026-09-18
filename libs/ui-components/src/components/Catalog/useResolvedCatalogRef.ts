import * as React from 'react';
import type { CatalogItemRefSpec } from '@flightctl/types';
import type { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';

import { type ResolvedCatalogRef, resolveCatalogRef, toCatalogItemId } from '../../utils/catalog';
import { useOptionalCatalogItemsContext } from './CatalogItemsContext';
import { useCatalogItemsLookup } from './useCatalogItemsLookup';

export type UseResolvedCatalogRefResult = {
  item: CatalogItem | undefined;
  version: CatalogItemVersion | undefined;
  channel: string;
  imageUri: string | undefined;
  isLoading: boolean;
  error?: unknown;
};

/**
 * Resolves one catalogItemRef to display label and optional OCI URI.
 * Prefers CatalogItemsProvider cache when present; falls back to a local
 * fetch for refs not yet in the provider's saved-spec id list (e.g. newly
 * added catalog apps in a wizard before save).
 */
export const useResolvedCatalogRef = (ref: CatalogItemRefSpec | undefined): UseResolvedCatalogRefResult | undefined => {
  const contextLookup = useOptionalCatalogItemsContext();
  const contextItem = ref && contextLookup ? contextLookup.getItem(ref.catalog, ref.item) : undefined;

  // Wait for the shared provider to finish before treating a miss as "needs local fetch",
  // so we don't duplicate requests for items that are already on the saved spec.
  const needsLocalFetch = Boolean(ref && !contextItem && (!contextLookup || !contextLookup.isLoading));

  const catalog = ref?.catalog;
  const itemName = ref?.item;
  const localIds = React.useMemo(() => {
    if (!needsLocalFetch || !catalog || !itemName) {
      return [];
    }
    return [toCatalogItemId({ catalog, item: itemName })];
  }, [needsLocalFetch, catalog, itemName]);

  const localLookup = useCatalogItemsLookup(localIds);

  if (!ref) {
    return undefined;
  }

  const item = contextItem ?? localLookup.getItem(ref.catalog, ref.item);
  const resolved: ResolvedCatalogRef | undefined = item ? resolveCatalogRef(item, ref) : undefined;

  return {
    item,
    version: resolved?.version,
    channel: resolved?.channel || ref.channel || '',
    imageUri: resolved?.imageUri,
    isLoading:
      !item && Boolean(contextLookup?.isLoading || localLookup.isLoading || (needsLocalFetch && !localLookup.error)),
    error: item ? undefined : localLookup.error ?? contextLookup?.error,
  };
};
