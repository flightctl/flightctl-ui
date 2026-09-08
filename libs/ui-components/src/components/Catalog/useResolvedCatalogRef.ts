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
 * Uses CatalogItemsProvider when present; otherwise fetches locally.
 */
export const useResolvedCatalogRef = (ref: CatalogItemRefSpec | undefined): UseResolvedCatalogRefResult | undefined => {
  const contextLookup = useOptionalCatalogItemsContext();
  const localIds = React.useMemo(() => (!contextLookup && ref ? [toCatalogItemId(ref)] : []), [contextLookup, ref]);
  const localLookup = useCatalogItemsLookup(localIds);

  if (!ref) {
    return undefined;
  }

  const lookup = contextLookup ?? localLookup;
  const item = lookup.getItem(ref.catalog, ref.item);
  const resolved: ResolvedCatalogRef | undefined = item ? resolveCatalogRef(item, ref) : undefined;

  return {
    item,
    version: resolved?.version,
    channel: resolved?.channel || ref.channel || '',
    imageUri: resolved?.imageUri,
    isLoading: lookup.isLoading,
    error: lookup.error,
  };
};
